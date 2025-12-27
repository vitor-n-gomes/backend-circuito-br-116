import { Injectable, Logger } from '@nestjs/common';
import { LegacyBusiness } from '../legacy-models/legacy-business.entity';
import { CoordinateParser } from '../utils/coordinate-parser.util';

/**
 * Mapper for Business data from MySQL cadastro table to PostgreSQL
 */
@Injectable()
export class BusinessMigrationMapper {
  private readonly logger = new Logger(BusinessMigrationMapper.name);

  /**
   * Maps legacy MySQL cadastro data to our PostgreSQL Business entity structure
   */
  mapToEntity(legacy: LegacyBusiness, defaults: Partial<any> = {}): any {
    // Parse coordinates from mapa or ponto fields
    const coords = this.extractCoordinates(legacy);

    // Determine best phone number to use
    const phoneNumber = this.selectBestPhone(legacy);

    // Build full address
    const fullAddress = this.buildFullAddress(legacy);

    // Map nivel to classification (f -> F1, a -> A1, b -> B1, etc.)
    const classification = this.mapNivelToClassification(legacy.nivel);

    // Combine informacoes and obsinternas for description
    const description = this.buildDescription(legacy);

    return {
      title: this.sanitizeString(legacy.empresa) || 'Empresa Importada',
      description: description,
      locationLat: coords.latitude,
      locationLong: coords.longitude,
      locationId: defaults.locationId || 1,
      categoryId: this.mapPalavrachaveToCategory(legacy.palavrachave) || defaults.categoryId || 1,
      accountId: defaults.accountId || 1,
      phoneNumber: phoneNumber,
      email: this.sanitizeEmail(legacy.email),
      address: fullAddress,
      locationPretty: this.buildLocationPretty(legacy),
      whatsapp: this.sanitizePhone(legacy.whats1) || this.sanitizePhone(legacy.whats2),
      facebook: this.sanitizeString(legacy.facebook),
      instagram: this.extractInstagramFromSite(legacy.site),
      views: legacy.visitas || 0,
      isVerified: legacy.nivel !== 'f' && legacy.pago === 's',
      classification: classification,
      promotedAt: this.determinePromotedAt(legacy),
      createdAt: legacy.datacadastro || legacy.dataatualizada || new Date(),
      updatedAt: legacy.dataatualizada || legacy.datacadastro || new Date(),
    };
  }

  /**
   * Extract coordinates from mapa or ponto fields
   */
  private extractCoordinates(legacy: LegacyBusiness): { latitude: number; longitude: number } {
    // Try mapa field first
    let coords = CoordinateParser.parse(legacy.mapa);
    
    // Try ponto field if mapa didn't work
    if (!coords && legacy.ponto) {
      coords = CoordinateParser.parseFromPonto(legacy.ponto);
    }

    // Return coordinates or default to 0,0
    return coords || { latitude: 0, longitude: 0 };
  }

  /**
   * Select the best phone number from available fields
   * Priority: celular > telefone > whats1 > whats2
   */
  private selectBestPhone(legacy: LegacyBusiness): string | undefined {
    const phones = [
      legacy.celular,
      legacy.telefone,
      legacy.whats1,
      legacy.whats2,
    ];

    for (const phone of phones) {
      const sanitized = this.sanitizePhone(phone);
      if (sanitized) {
        return sanitized;
      }
    }

    return undefined;
  }

  /**
   * Build full address from components
   */
  private buildFullAddress(legacy: LegacyBusiness): string | undefined {
    const parts: string[] = [];

    if (legacy.endereco) parts.push(legacy.endereco.trim());
    if (legacy.bairro) parts.push(legacy.bairro.trim());
    if (legacy.cidade) parts.push(legacy.cidade.trim());
    if (legacy.estado) parts.push(legacy.estado.trim());
    if (legacy.cep) parts.push(`CEP: ${legacy.cep.trim()}`);

    return parts.length > 0 ? parts.join(', ') : undefined;
  }

  /**
   * Build location pretty string (cidade - estado)
   */
  private buildLocationPretty(legacy: LegacyBusiness): string {
    if (legacy.cidade && legacy.estado) {
      return `${legacy.cidade.trim()} - ${legacy.estado.trim().toUpperCase()}`;
    }
    if (legacy.cidade) {
      return legacy.cidade.trim();
    }
    return 'Localização não informada';
  }

  /**
   * Build description from informacoes and obsinternas
   */
  private buildDescription(legacy: LegacyBusiness): string | undefined {
    const parts: string[] = [];

    if (legacy.informacoes && legacy.informacoes.trim()) {
      parts.push(legacy.informacoes.trim());
    }

    // Only include obsinternas if it contains useful info (not just internal notes)
    if (legacy.obsinternas && legacy.obsinternas.trim() && legacy.obsinternas.length < 500) {
      parts.push(legacy.obsinternas.trim());
    }

    if (parts.length > 0) {
      return parts.join('\n\n');
    }

    return this.sanitizeString(legacy.empresa) 
      ? `${legacy.empresa} - Importado do sistema legado`
      : undefined;
  }

  /**
   * Map nivel (f, a, b, c, etc.) to classification (F1, A1, B1, C1, etc.)
   */
  private mapNivelToClassification(nivel: string | null | undefined): string {
    if (!nivel || nivel.length === 0) {
      return 'F1'; // Default free level
    }

    const upper = nivel.toUpperCase();
    return `${upper}1`;
  }

  /**
   * Determine if business should have promotedAt date
   * Based on nivel and pago status
   */
  private determinePromotedAt(legacy: LegacyBusiness): Date | undefined {
    // If paid and has elevation date
    if (legacy.pago === 's' && legacy.datadeelevacao) {
      return legacy.datadeelevacao;
    }

    // If has contribution date and is paid
    if (legacy.pago === 's' && legacy.datacontribui) {
      return legacy.datacontribui;
    }

    // If nivel is not 'f' (free), consider it promoted
    if (legacy.nivel && legacy.nivel !== 'f' && legacy.dataatualizada) {
      return legacy.dataatualizada;
    }

    return undefined;
  }

  /**
   * Try to map palavrachave to a category ID
   * Format: "materiais_para_construções" (underscores instead of spaces)
   * This is a simple implementation - you may want to create a lookup table
   */
  private mapPalavrachaveToCategory(palavrachave: string | null | undefined): number | undefined {
    if (!palavrachave) {
      return undefined;
    }

    // Normalize: replace underscores with spaces, lowercase, trim
    const keyword = palavrachave.toLowerCase().trim().replace(/_/g, ' ');

    // Extended keyword mapping - add more as you identify categories
    const categoryMap: { [key: string]: number } = {
      // Food & Dining
      'restaurante': 1,
      'lanchonete': 1,
      'pizzaria': 1,
      'churrascaria': 1,
      'bar': 1,
      'cafeteria': 1,
      'padaria': 1,
      
      // Accommodation
      'hotel': 2,
      'pousada': 2,
      'motel': 2,
      'hostel': 2,
      'camping': 3,
      
      // Fuel & Auto
      'posto': 4,
      'combustivel': 4,
      'gasolina': 4,
      'mecanica': 6,
      'oficina': 6,
      'auto pecas': 6,
      'borracharia': 6,
      
      // Shopping
      'mercado': 5,
      'supermercado': 5,
      'minimercado': 5,
      'loja': 5,
      'comercio': 5,
      
      // Construction
      'materiais para construcoes': 7,
      'construcao': 7,
      'ferragem': 7,
      'madeireira': 7,
      
      // Services
      'farmacia': 8,
      'drogaria': 8,
      'clinica': 9,
      'hospital': 9,
      'medico': 9,
      'dentista': 9,
      
      // Add more mappings as needed
    };

    // Check for exact match or partial match
    for (const [key, categoryId] of Object.entries(categoryMap)) {
      if (keyword === key || keyword.includes(key)) {
        return categoryId;
      }
    }

    // Log unmapped keywords for future reference
    this.logger.debug(`Unmapped keyword: "${palavrachave}" (normalized: "${keyword}")`);

    return undefined;
  }

  /**
   * Extract Instagram handle from site URL if it contains instagram.com
   */
  private extractInstagramFromSite(site: string | null | undefined): string | undefined {
    if (!site) {
      return undefined;
    }

    const lower = site.toLowerCase();
    if (lower.includes('instagram.com')) {
      // Extract username from URL
      const match = site.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Sanitize string - trim and handle nulls
   */
  private sanitizeString(value: string | null | undefined): string | undefined {
    if (!value || value.trim() === '') return undefined;
    return value.trim();
  }

  /**
   * Sanitize phone number - remove non-numeric characters
   */
  private sanitizePhone(phone: string | null | undefined): string | undefined {
    if (!phone) return undefined;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 ? cleaned : undefined;
  }

  /**
   * Sanitize email - basic validation
   */
  private sanitizeEmail(email: string | null | undefined): string | undefined {
    if (!email) return undefined;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@') || trimmed.length < 5) return undefined;
    return trimmed;
  }

  /**
   * Generate unique key for duplicate detection
   */
  generateUniqueKey(legacy: LegacyBusiness): string {
    return `${legacy.empresa?.toLowerCase().trim() || 'unknown'}-${legacy.celular || legacy.telefone || legacy.codcadastro}`;
  }
}
