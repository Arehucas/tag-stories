declare module "*.json" {
  const value: any;
  export default value;
}

interface Ambassador {
  _id: string; // Usar string para compatibilidad global
  igName?: string;
  createdAt: Date;
  updatedAt: Date;
  stories: string[];
  campaigns: string[];
  providers: string[];
}

interface Story {
  _id: string;
  providerId: string;
  campaignId: string;
  campaignName: string;
  templateId: string;
  imageUrl: string;
  status: string;
  createdAt: Date;
  ambassadorId: string; // Nuevo campo
} 