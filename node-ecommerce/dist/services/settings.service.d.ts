export declare const WHATSAPP_KEY = "whatsapp_number";
export declare function getWhatsappSetting(): Promise<{
    whatsappNumber: string;
    updatedAt: Date | null;
}>;
export declare function updateWhatsappSetting(data: unknown): Promise<{
    whatsappNumber: string;
    updatedAt: Date;
}>;
//# sourceMappingURL=settings.service.d.ts.map