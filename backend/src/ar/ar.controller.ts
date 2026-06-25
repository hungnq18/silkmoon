import { Controller, Post, Body, Get, HttpException, HttpStatus, UseInterceptors, UploadedFile, Param, Res, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ARService } from './ar.service';
import { Response } from 'express';

// In-memory cache for USDZ files to act as a relay for iOS AR Quick Look
const usdzCache = new Map<string, Buffer>();

@Controller('ar')
export class ARController {
  constructor(private readonly arService: ARService) {}

  // ── Temporary: list models to find image generation support ──
  @Get('list-models')
  async listModels() {
    return this.arService.listAvailableModels();
  }

  @Post('detect-bed')
  async detectBed(@Body() body: { image: string }) {
    if (!body.image) {
      throw new HttpException('Image data is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const corners = await this.arService.detectBedCorners(body.image);
      return { success: true, corners };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to detect bed corners',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // --- VERSION 1 & 2 ARCHITECTURE SCAFFOLDING ---

  @Post('segment')
  async segmentBed(@Body() body: { image: string }) {
    if (!body.image) throw new HttpException('No image provided', HttpStatus.BAD_REQUEST);
    
    // Future implementation: Send body.image to Python Microservice (SAM2 + Grounding DINO)
    // to get exact pixel masks for mattress, blanket, pillows.
    return {
      success: true,
      message: 'Segmentation mask endpoint scaffolding ready (Phase 1)',
      masks: {
        mattress: null,
        blanket: null,
        pillows: null
      }
    };
  }

  @Post('upload')
  async uploadImage(@Body() body: { image: string }) {
    if (!body.image) throw new HttpException('Missing image data', HttpStatus.BAD_REQUEST);
    try {
      const url = await this.arService.uploadImageToCloudinary(body.image);
      return { success: true, url };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('auto-tryon')
  async autoTryOn(@Body() body: { roomImageUrl: string, productImageUrl?: string, prompt: string }) {
    if (!body.roomImageUrl) throw new HttpException('Missing room image URL', HttpStatus.BAD_REQUEST);

    try {
      // 1. Get Mask from Grounded SAM
      const maskUrl = await this.arService.autoSegmentBed(body.roomImageUrl);

      // 2. Inpaint using SDXL with the mask
      const resultImage = await this.arService.inpaintBed(
        body.roomImageUrl, 
        maskUrl, 
        body.prompt || 'silk fabric',
        body.productImageUrl
      );

      return {
        success: true,
        message: 'Auto Try-On completed successfully',
        resultImage: resultImage,
        maskImage: maskUrl // return mask just for debugging/frontend display if needed
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to complete auto try-on',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('inpaint')
  async inpaintBed(@Body() body: { imageUrl: string, maskUrl: string, prompt: string, productImageUrl?: string }) {
    if (!body.imageUrl || !body.maskUrl) throw new HttpException('Missing image or mask URL', HttpStatus.BAD_REQUEST);

    try {
      const resultImage = await this.arService.inpaintBed(body.imageUrl, body.maskUrl, body.prompt || 'silk fabric', body.productImageUrl);
      return {
        success: true,
        message: 'Inpainting completed successfully',
        resultImage: resultImage
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to inpaint bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-preview')
  async generatePreview(@Body() body: { imageUrl?: string; image?: string; color: string; fabricName?: string }) {
    if (!body.image && !body.imageUrl) {
      throw new HttpException('Image data or URL is required', HttpStatus.BAD_REQUEST);
    }
    try {
      let base64Input: string = body.image || '';
      if (body.imageUrl) {
        // Fetch from Cloudinary
        const response = await fetch(body.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        base64Input = `data:image/jpeg;base64,${base64Data}`;
      }

      // Generate with Gemini
      const resultBase64 = await this.arService.generateBedOverlay(
        base64Input,
        body.color || '#C9A882',
        body.fabricName || 'champagne silk',
      );

      // Upload the result to Cloudinary to save bandwidth
      const resultUrl = await this.arService.uploadImageToCloudinary(resultBase64);

      return { success: true, image: resultUrl }; // Return Cloudinary URL
    } catch (error) {
      if (error.message?.startsWith('QUOTA_EXCEEDED') || (error as any).code === 'QUOTA_EXCEEDED') {
        throw new HttpException(
          { success: false, error: 'quota_exceeded', message: 'AI đang bận. Vui lòng đợi ~60 giây và thử lại.' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new HttpException(
        { success: false, error: 'generate_failed', message: error.message || 'Failed to generate preview' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // --- Backend Image Proxy (CORS Bypass) ---

  @Get('proxy-image')
  async proxyImage(@Query('url') imageUrl: string, @Res() res: Response) {
    if (!imageUrl) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing url parameter');
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Forward the original content type, or default to jpeg
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      res.setHeader('Content-Type', contentType);
      // Ensure cross-origin is explicitly allowed
      res.setHeader('Access-Control-Allow-Origin', '*');
      // Set cache control for performance
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      res.send(buffer);
    } catch (error) {
      console.error('[Proxy Image Error]', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to proxy image');
    }
  }

  // --- iOS AR Quick Look USDZ Relay ---

  @Post('upload-usdz')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUsdz(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }
    
    const id = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    usdzCache.set(id, file.buffer);
    
    // Auto-cleanup after 10 minutes to prevent memory leaks
    setTimeout(() => {
      usdzCache.delete(id);
    }, 10 * 60 * 1000);

    return { 
      success: true, 
      id,
      url: `/api/v1/ar/usdz/${id}.usdz` 
    };
  }

  @Get('usdz/:filename')
  getUsdz(@Param('filename') filename: string, @Res() res: Response) {
    const id = filename.replace('.usdz', '');
    const buffer = usdzCache.get(id);
    
    if (!buffer) {
      return res.status(HttpStatus.NOT_FOUND).send('USDZ file not found or expired');
    }

    res.setHeader('Content-Type', 'model/vnd.usdz+zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
