import { ObjectId } from 'mongodb';

export interface Template {
  _id: ObjectId | string;
  templateName: string;
  providerParentId: ObjectId | null;
  logoSize: number;
  marginBottom: number;
  marginRight: number;
  displayLogo: boolean;
  displayText: boolean;
  igText: {
    size: number;
    color: string;
    opacity: number;
  };
  addressText: {
    size: number;
    color: string;
    opacity: number;
  };
  overlayUrl: string;
  plan: 'free' | 'pro';
  type: string;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
  previewUrl?: string;
  order?: number;
  tags?: string[];
  supportedFormats?: string[];
  aspectRatio?: string;
} 