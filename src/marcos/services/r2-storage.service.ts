import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly accountId: string;
  private readonly publicUrl: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>(
      'R2_ACCOUNT_ID',
      '28a4598807bce062499a884e282c15b7',
    );
    this.bucketName = this.configService.get<string>(
      'R2_BUCKET_NAME',
      'obsidian-vault',
    );
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');

    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
      '',
    );

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
      this.logger.log(
        `✅ Cloudflare R2 configurado para bucket: "${this.bucketName}" (Cuenta: ${this.accountId})`,
      );
    } else {
      this.isConfigured = false;
      this.logger.warn(
        `⚠️ Cloudflare R2 sin credenciales (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY). Usando almacenamiento local de respaldo.`,
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const key = `marcos/marco-${uniqueSuffix}${ext}`;

    if (this.isConfigured && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);
        this.logger.log(`📤 Archivo subido exitosamente a R2: ${key}`);

        // Build Public URL
        let fileUrl: string;
        if (this.publicUrl) {
          const cleanPublic = this.publicUrl.replace(/\/+$/, '');
          fileUrl = `${cleanPublic}/${key}`;
        } else {
          // Default R2 dev public or direct URL
          fileUrl = `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
        }

        return {
          url: fileUrl,
          key,
        };
      } catch (err: any) {
        this.logger.error(`❌ Error al subir a Cloudflare R2: ${err.message}`, err.stack);
        throw err;
      }
    }

    // Local disk fallback if R2 credentials not provided
    const uploadsDir = join(__dirname, '..', '..', '..', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    const localFilename = `marco-${uniqueSuffix}${ext}`;
    const localFilePath = join(uploadsDir, localFilename);
    writeFileSync(localFilePath, file.buffer);

    return {
      url: `/uploads/${localFilename}`,
      key: localFilename,
    };
  }
}
