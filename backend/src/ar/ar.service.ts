import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiUsage, AiUsageDocument } from './ai-usage.schema';
import { SILKMOON_CHATBOT_KNOWLEDGE } from './chatbot-knowledge';

/**
 * Bed detection strategy:
 *
 * Instead of asking Gemini for 4 corner pixel coordinates (which is unreliable),
 * we ask for 5 simpler, independent values the model can answer more accurately:
 * 
 *   headboard_y  — y where the flat sheet surface starts (below pillows/headboard)
 *   foot_y       — y where the flat surface ENDS at the foot edge
 *   left_x       — x of the LEFT side of the mattress at its widest (foot side)
 *   right_x      — x of the RIGHT side at its widest
 *   taper        — how much each side tapers inward at the headboard (0=none, 0.1=strong)
 *
 * From these we build a trapezoid:
 *   tl = { x: left_x  + taper, y: headboard_y }
 *   tr = { x: right_x - taper, y: headboard_y }
 *   bl = { x: left_x,          y: foot_y }
 *   br = { x: right_x,         y: foot_y }
 */
@Injectable()
export class ARService {
  private readonly logger = new Logger(ARService.name);
  private ai: GoogleGenAI | null = null;
  private replicate: Replicate | null = null;

  constructor(private configService: ConfigService, @InjectModel(AiUsage.name) private usageModel: Model<AiUsageDocument>) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.logger.log('Gemini API initialized successfully.');
    } else {
      this.logger.warn('GEMINI_API_KEY is not set. AI auto-detection will fail gracefully.');
    }

    const replicateApiToken = this.configService.get<string>('REPLICATE_API_TOKEN');
    if (replicateApiToken) {
      this.replicate = new Replicate({ auth: replicateApiToken });
      this.logger.log('Replicate API initialized successfully.');
    } else {
      this.logger.warn('REPLICATE_API_TOKEN is not set. Inpainting AI features will fail.');
    }

    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
    if (cloudinaryUrl) {
      process.env.CLOUDINARY_URL = cloudinaryUrl;
      cloudinary.config(true); // force reload from process.env
      this.logger.log('Cloudinary initialized successfully.');
    } else {
      this.logger.warn('CLOUDINARY_URL is not set. Image uploads will fail.');
    }
  }

  private async recordUsage(feature: string, model: string, response: any) {
    const usage = response?.usageMetadata || {};
    await this.usageModel.create({ feature, provider: 'gemini', modelName: model, promptTokens: usage.promptTokenCount || 0, outputTokens: usage.candidatesTokenCount || 0, totalTokens: usage.totalTokenCount || 0, success: true });
  }

  async chat(message: string, systemPrompt?: string, history: Array<{ role: string; text: string }> = []) {
    if (!this.ai) throw new Error('Gemini API is not configured.');
    const modelName = 'gemini-2.5-flash';
    const safeHistory = history.slice(-10).map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.text || '').slice(0, 1500) }],
    }));
    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: [...safeHistory, { role: 'user', parts: [{ text: String(message || '').slice(0, 2000) }] }],
      config: {
        systemInstruction: `${SILKMOON_CHATBOT_KNOWLEDGE}\n\nCHỈ DẪN BỔ SUNG TỪ QUẢN TRỊ VIÊN:\n${systemPrompt || 'Không có.'}`,
        temperature: 0.3,
        maxOutputTokens: 650,
      },
    });
    await this.recordUsage('chatbot', modelName, response);
    return { message: response.text?.trim() || 'Xin lỗi, tôi chưa thể trả lời câu hỏi này.' };
  }

  async detectBedCorners(base64Image: string): Promise<any> {
    if (!this.ai) {
      throw new Error('Gemini API is not configured. Please add GEMINI_API_KEY to .env.');
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are a precise computer vision AI. Locate the 8 corners of the 3D bed structure in this bedroom photo.
Use normalized coordinates: x (0.0 left to 1.0 right), y (0.0 top to 1.0 bottom).

Analyze the 3D perspective and angles of the bed carefully.
Top Surface (The flat mattress surface where people sleep):
- tfl (headboard top left)
- tfr (headboard top right)
- tbl (foot top left)
- tbr (foot top right)

Bottom Surface (Where the bed frame touches the floor directly below the top surface):
- bbl (headboard bottom left floor)
- bbr (headboard bottom right floor)
- bfl (foot bottom left floor)
- bfr (foot bottom right floor)

CRITICAL PERSPECTIVE RULE: 
- The foot of the bed (closer to camera) MUST appear wider than the headboard due to perspective.
- tbl.x MUST be < tfl.x (further left), and tbr.x MUST be > tfr.x (further right).
- Ensure the 8 points form a valid 3D cuboid matching the bed's exact rotation and perspective in the room.

Output ONLY this JSON format:
{
  "tfl": {"x": 0.0, "y": 0.0},
  "tfr": {"x": 0.0, "y": 0.0},
  "tbl": {"x": 0.0, "y": 0.0},
  "tbr": {"x": 0.0, "y": 0.0},
  "bbl": {"x": 0.0, "y": 0.0},
  "bbr": {"x": 0.0, "y": 0.0},
  "bfl": {"x": 0.0, "y": 0.0},
  "bfr": {"x": 0.0, "y": 0.0}
}`;

    // Use Pro model first for accurate spatial reasoning
    const currentModels = [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
    ];
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    let lastError: Error | undefined;

    for (let i = 0; i < currentModels.length; i++) {
      const modelName = currentModels[i];
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          this.logger.log(`[Detection] ${modelName} (attempt ${attempt})...`);

          const response = await this.ai!.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                  { text: prompt },
                ],
              },
            ],
            config: { temperature: 0.05 },
          });
          await this.recordUsage('ar_detection', modelName, response);

          let raw = response.text?.trim() || '';
          if (!raw) throw new Error(`Empty response from ${modelName}`);

          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) raw = jsonMatch[0];
          
          const m = JSON.parse(raw);

          const points = ['tfl', 'tfr', 'tbl', 'tbr', 'bbl', 'bbr', 'bfl', 'bfr'];
          let coordSum = 0;
          for (const pt of points) {
            if (!m[pt] || typeof m[pt].x !== 'number' || typeof m[pt].y !== 'number') {
              throw new Error(`Missing or invalid point: ${pt}`);
            }
            coordSum += m[pt].x + m[pt].y;
          }

          if (coordSum === 0) throw new Error(`Model returned template coordinates`);

          const clamp = (v: number) => Math.max(0, Math.min(1, v));

          const result = {
            tfl: { x: clamp(m.tfl.x), y: clamp(m.tfl.y) },
            tfr: { x: clamp(m.tfr.x), y: clamp(m.tfr.y) },
            tbl: { x: clamp(m.tbl.x), y: clamp(m.tbl.y) },
            tbr: { x: clamp(m.tbr.x), y: clamp(m.tbr.y) },
            bbl: { x: clamp(m.bbl.x), y: clamp(m.bbl.y) },
            bbr: { x: clamp(m.bbr.x), y: clamp(m.bbr.y) },
            bfl: { x: clamp(m.bfl.x), y: clamp(m.bfl.y) },
            bfr: { x: clamp(m.bfr.x), y: clamp(m.bfr.y) },
          };

          this.logger.log(`[Result] ${JSON.stringify(result)}`);
          return result;

        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          const msg = String(error.message ?? error);
          const is503 = msg.includes('503') || msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('high demand');

          if (is503 && attempt < 3) {
            const delay = attempt * 2000;
            this.logger.warn(`[Detection] ${modelName} busy, retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }

          const is429 = msg.includes('429') || msg.includes('4299') || msg.toLowerCase().includes('quota');
          if (is429) {
            this.logger.warn(`[Detection] ${modelName} hit quota/429. Skipping to next model.`);
          }

          this.logger.warn(`[Detection] ${modelName} failed: ${msg.substring(0, 120)}`);
          lastError = error;
          break;
        }
      }
    }

    this.logger.error('[Detection] All models exhausted:', lastError?.message);
    throw lastError;

  }

  /**
   * Uses Gemini image generation to directly render the silk fabric on the bed.
   * Returns a base64-encoded JPEG of the AI-edited room image.
   */
  async generateBedOverlay(
    base64Image: string,
    colorHex: string,
    fabricName: string,
    customPrompt?: string,
  ): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini API is not configured.');
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const defaultPrompt = `You are an expert interior design visualizer.

Task: Edit this bedroom photo to show what the bed would look like with a new bed sheet.

Instructions:
- Replace the ENTIRE bedding set (including all bed sheets, blankets, duvet covers, and pillows) with a luxurious silk fabric in the color: ${fabricName} (hex: ${colorHex})
- The silk fabric should have a subtle sheen and slight texture typical of high-quality silk bedding
- Keep the EXACT SAME perspective, lighting, shadows, and room composition
- Keep the headboard, footboard, bed frame, nightstands, walls, floors, and room decor completely unchanged
- The new fabric should follow the same folds, wrinkles, and draping as the original
- Maintain photorealistic quality — this should look like a real product photo

Output: The edited bedroom photo with the entire bedding set color changed to ${fabricName}.`;
    const prompt = customPrompt
      ? `${customPrompt}\nMàu sản phẩm: ${fabricName} (${colorHex}). Giữ nguyên phối cảnh, ánh sáng, nội thất và chỉ thay đổi bộ chăn ga trên giường.`
      : defaultPrompt;

    const freeModels = [
      'gemini-3.1-flash-lite-image',
      'gemini-3.1-flash-image',
      'gemini-2.5-flash-image',
    ];
    const proModels = ['gemini-3-pro-image'];

    let quotaExceeded = false;
    let lastGenerationError = '';
    let currentModels = [...freeModels];

    for (let i = 0; i < currentModels.length; i++) {
      const modelName = currentModels[i];
      try {
        this.logger.log(`[Generate] Trying ${modelName}...`);

        const response = await this.ai!.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
            temperature: 0.4,
          } as any,
        });
        await this.recordUsage('ar_generation', modelName, response);

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

        if (imagePart?.inlineData?.data) {
          this.logger.log(`[Generate] ✓ Success with ${modelName}`);
          return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }

        this.logger.warn(`[Generate] ${modelName}: no image part in response`);
      } catch (err) {
        const msg = String((err as Error).message ?? err);
        const normalized = msg.toLowerCase();
        lastGenerationError = msg;
        if (msg.includes('401') || normalized.includes('api key not valid') || normalized.includes('unauthenticated')) {
          throw new Error('API_KEY_INVALID: Gemini API key không hợp lệ hoặc đã bị thu hồi.');
        }
        if (msg.includes('403') || normalized.includes('billing') || normalized.includes('paid tier') || normalized.includes('permission_denied')) {
          throw new Error('BILLING_REQUIRED: Project Google AI chưa có quyền tạo ảnh. Hãy bật billing cho project chứa GEMINI_API_KEY.');
        }
        const is429 = msg.includes('429') || msg.includes('4299') || msg.toLowerCase().includes('quota');
        if (is429) {
          this.logger.warn(`[Generate] ${modelName}: quota exceeded (429/4299)`);
          if (!proModels.includes(modelName)) {
            this.logger.log(`[Generate] Switching to Pro models due to 429/4299...`);
            currentModels = [...proModels];
            i = -1; // reset loop to start of proModels
            continue;
          } else {
            quotaExceeded = true;
          }
        } else if (msg.includes('404') || msg.includes('NOT_FOUND')) {
          this.logger.warn(`[Generate] ${modelName}: not found`);
        } else {
          this.logger.warn(`[Generate] ${modelName}: ${msg.substring(0, 150)}`);
        }
      }
    }

    if (quotaExceeded) {
      // Throw a specific error the frontend can detect and show a retry countdown
      const err = new Error('QUOTA_EXCEEDED: Image generation quota reached. Please wait ~60 seconds and try again.');
      (err as any).code = 'QUOTA_EXCEEDED';
      throw err;
    }

    this.logger.error(`[Generate] All image models failed: ${lastGenerationError || 'No image result'}`);
    throw new Error('IMAGE_MODEL_FAILED');
  }

  /** Lists available Gemini models — useful for debugging which ones support image output. */
  async listAvailableModels(): Promise<any> {
    if (!this.ai) throw new Error('Gemini API not configured.');
    try {
      const pager = await this.ai!.models.list();
      const models: any[] = [];
      for await (const m of pager) {
        models.push({
          name: m.name,
          displayName: m.displayName,
          supportedMethods: (m as any).supportedGenerationMethods,
          outputModalities: (m as any).outputModalities,
        });
      }
      // Sort by name for readability
      models.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      // Highlight models that support image output
      const imageModels = models.filter(m =>
        m.outputModalities?.includes('IMAGE') ||
        m.name?.includes('image') ||
        m.name?.includes('imagen')
      );
      return { total: models.length, imageCapable: imageModels, all: models };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: message };
    }
  }

  // --- REPLICATE API & CLOUDINARY (Phase 1 & 2) ---

  /**
   * Upload a base64 image to Cloudinary and return the public URL.
   */
  async uploadImageToCloudinary(base64Image: string, folder = 'silkmoon_ar'): Promise<string> {
    this.logger.log('[Cloudinary] Uploading image...');
    try {
      const result = await cloudinary.uploader.upload(base64Image, {
        folder,
      });
      this.logger.log(`[Cloudinary] Upload success: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Cloudinary] Upload failed: ${message}`);
      throw new Error(`Cloudinary upload failed: ${message}`);
    }
  }

  /**
   * Use schananas/grounded_sam to automatically segment the bed and get a mask.
   */
  async autoSegmentBed(imageUrl: string): Promise<string> {
    if (!this.replicate) throw new Error('Replicate API is not configured.');
    this.logger.log(`[Replicate SAM] Segmenting bed for image...`);
    
    try {
      const output = await this.replicate.run(
        "schananas/grounded_sam:f96dcb0e1eb0439010d96aae1d4ab4d8783376f7f6778477aaefc003b464585b",
        {
          input: {
            image: imageUrl,
            prompt: "bed, mattress",
            negative_prompt: "pillows, walls, floor, headboard"
          }
        }
      );

      // Output is an array of URLs. Usually the first or second is the mask.
      // Grounded SAM usually returns: [masked_image_url, mask_only_url, ...].
      // For standard masks, we want the white/black mask or transparent mask.
      const resultUrl = Array.isArray(output) ? (output.length > 1 ? output[1] : output[0]) : output;
      
      if (!resultUrl) throw new Error('SAM returned empty result.');
      this.logger.log(`[Replicate SAM] Segmentation Success: ${resultUrl}`);
      return resultUrl as string;
    } catch (error) {
      this.logger.error(`[Replicate SAM] Segmentation Failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Replicate Inpainting: Replaces the masked area with the new fabric description.
   * Uses stability-ai/stable-diffusion-inpainting
   */
  async inpaintBed(
    imageUrl: string,
    maskUrl: string,
    promptText: string,
    productImageUrl?: string,
  ): Promise<string> {
    if (!this.replicate) {
      throw new Error('Replicate API is not configured. Add REPLICATE_API_TOKEN to .env.');
    }

    this.logger.log(`[Replicate] Starting Inpainting...`);
    
    // We use a known stable-diffusion-inpainting model ID on Replicate
    // Or SDXL Inpainting.
    const model = 'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd58bf';

    try {
      // NOTE: We could use a ControlNet or IP-Adapter model if productImageUrl is provided.
      // For now, we use standard SDXL inpainting with a highly descriptive prompt.
      const output = await this.replicate.run(model, {
        input: {
          image: imageUrl,
          mask: maskUrl,
          prompt: `A photorealistic luxurious bed sheet made of ${promptText}. Natural lighting, highly detailed, sharp focus. The bed sheet has realistic folds, wrinkles, and shadows conforming to the mattress shape.`,
          negative_prompt: "bad anatomy, blurry, distorted, messy, unrealistic, cartoon, painting, drawing, bad lighting, extra objects",
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        }
      });

      // Replicate usually returns an array of URLs for image generation models
      const resultUrl = Array.isArray(output) ? output[0] : output;
      
      if (!resultUrl) {
        throw new Error('Replicate returned an empty result.');
      }

      this.logger.log(`[Replicate] Inpainting Success: ${resultUrl}`);
      return resultUrl as string;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Replicate] Inpainting Failed: ${message}`);
      throw error;
    }
  }
}
