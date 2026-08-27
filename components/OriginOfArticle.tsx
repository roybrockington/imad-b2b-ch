'use client';

import { useState } from 'react';
import { Product, Supplier } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface OriginOfArticleProps {
  product: Product;
}

interface EntitySectionProps {
  title: string;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postcode?: string | null;
  web?: string | null;
  email?: string | null;
  tel?: string | null;
  fax?: string | null;
}

const EntitySection = ({
  title,
  name,
  address,
  city,
  country,
  postcode,
  web,
  email,
  tel,
  fax
}: EntitySectionProps) => {
  // Check if any field has content
  const hasContent = name || address || city || country || postcode || web || email || tel || fax;
  const t = useTranslations('orders');

  if (!hasContent) return null;

  return (
    <div className="mb-6 last:mb-0">
      <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
      <div className="space-y-1 text-sm text-gray-600">
        {name && <p className="font-medium text-gray-800">{name}</p>}
        {address && <p>{address}</p>}
        {(postcode || city) && (
          <p>
            {postcode && <span>{postcode}</span>}
            {postcode && city && <span> </span>}
            {city && <span>{city}</span>}
          </p>
        )}
        {country && <p>{country}</p>}
        {tel && (
          <p>
            <span className="text-gray-500">{t('tel')}: </span>
            <a href={`tel:${tel}`} className="hover:text-brand">
              {tel}
            </a>
          </p>
        )}
        {fax && (
          <p>
            <span className="text-gray-500">Fax: </span>
            {fax}
          </p>
        )}
        {email && (
          <p>
            <span className="text-gray-500">Email: </span>
            <a href={`mailto:${email}`} className="hover:text-brand">
              {email}
            </a>
          </p>
        )}
        {web && (
          <p>
            <span className="text-gray-500">Web: </span>
            <a
              href={web.startsWith('http') ? web : `https://${web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand"
            >
              {web}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default function OriginOfArticle({ product }: OriginOfArticleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('product');

  // Get supplier data from product relationships, fallback to brand data if not available
  const manufacturerSupplier = product.manufacturer_supplier;
  const importerSupplier = product.importer_supplier;
  const officeSupplier = product.office_supplier;

  // Check if there's any supplier data to display
  const hasManufacturer = manufacturerSupplier && (
    manufacturerSupplier.name || manufacturerSupplier.address || manufacturerSupplier.city ||
    manufacturerSupplier.country || manufacturerSupplier.postcode || manufacturerSupplier.web ||
    manufacturerSupplier.email || manufacturerSupplier.phone || manufacturerSupplier.fax
  );

  const hasImporter = importerSupplier && (
    importerSupplier.name || importerSupplier.address || importerSupplier.city ||
    importerSupplier.country || importerSupplier.postcode || importerSupplier.web ||
    importerSupplier.email || importerSupplier.phone || importerSupplier.fax
  );

  const hasOffice = officeSupplier && (
    officeSupplier.name || officeSupplier.address || officeSupplier.city ||
    officeSupplier.country || officeSupplier.postcode || officeSupplier.web ||
    officeSupplier.email || officeSupplier.phone || officeSupplier.fax
  );

  // Fallback to brand data if no supplier data is available
  const hasBrandManufacturer = !hasManufacturer && product.brand && (
    product.brand.mfr || product.brand.mfr_address || product.brand.mfr_city ||
    product.brand.mfr_country || product.brand.mfr_postcode || product.brand.mfr_web ||
    product.brand.mfr_email || product.brand.mfr_tel || product.brand.mfr_fax
  );

  const hasBrandImporter = !hasImporter && product.brand && (
    product.brand.imp || product.brand.imp_address || product.brand.imp_city ||
    product.brand.imp_country || product.brand.imp_postcode || product.brand.imp_web ||
    product.brand.imp_email || product.brand.imp_tel || product.brand.imp_fax
  );

  const hasBrandOffice = !hasOffice && product.brand && (
    product.brand.off || product.brand.off_address || product.brand.off_city ||
    product.brand.off_country || product.brand.off_postcode || product.brand.off_web ||
    product.brand.off_email || product.brand.off_tel || product.brand.off_fax
  );

  // Don't render if there's no data at all
  if (!hasManufacturer && !hasImporter && !hasOffice &&
      !hasBrandManufacturer && !hasBrandImporter && !hasBrandOffice) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand transition-colors">
          {t('originOfArticle')}
        </h3>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manufacturer Section - Use supplier data if available, otherwise fall back to brand data */}
          {(hasManufacturer || hasBrandManufacturer) && (
            <EntitySection
              title={t('manufacturer')}
              name={hasManufacturer ? manufacturerSupplier?.name : product.brand?.mfr}
              address={hasManufacturer ? manufacturerSupplier?.address : product.brand?.mfr_address}
              city={hasManufacturer ? manufacturerSupplier?.city : product.brand?.mfr_city}
              country={hasManufacturer ? manufacturerSupplier?.country : product.brand?.mfr_country}
              postcode={hasManufacturer ? manufacturerSupplier?.postcode : product.brand?.mfr_postcode}
              web={hasManufacturer ? manufacturerSupplier?.web : product.brand?.mfr_web}
              email={hasManufacturer ? manufacturerSupplier?.email : product.brand?.mfr_email}
              tel={hasManufacturer ? manufacturerSupplier?.phone : product.brand?.mfr_tel}
              fax={hasManufacturer ? manufacturerSupplier?.fax : product.brand?.mfr_fax}
            />
          )}

          {/* Importer Section - Use supplier data if available, otherwise fall back to brand data */}
          {(hasImporter || hasBrandImporter) && (
            <EntitySection
              title={t('importer')}
              name={hasImporter ? importerSupplier?.name : product.brand?.imp}
              address={hasImporter ? importerSupplier?.address : product.brand?.imp_address}
              city={hasImporter ? importerSupplier?.city : product.brand?.imp_city}
              country={hasImporter ? importerSupplier?.country : product.brand?.imp_country}
              postcode={hasImporter ? importerSupplier?.postcode : product.brand?.imp_postcode}
              web={hasImporter ? importerSupplier?.web : product.brand?.imp_web}
              email={hasImporter ? importerSupplier?.email : product.brand?.imp_email}
              tel={hasImporter ? importerSupplier?.phone : product.brand?.imp_tel}
              fax={hasImporter ? importerSupplier?.fax : product.brand?.imp_fax}
            />
          )}

          {/* Office/Responsible Entity Section - Use supplier data if available, otherwise fall back to brand data */}
          {(hasOffice || hasBrandOffice) && (
            <EntitySection
              title={t('responsibleEntity')}
              name={hasOffice ? officeSupplier?.name : product.brand?.off}
              address={hasOffice ? officeSupplier?.address : product.brand?.off_address}
              city={hasOffice ? officeSupplier?.city : product.brand?.off_city}
              country={hasOffice ? officeSupplier?.country : product.brand?.off_country}
              postcode={hasOffice ? officeSupplier?.postcode : product.brand?.off_postcode}
              web={hasOffice ? officeSupplier?.web : product.brand?.off_web}
              email={hasOffice ? officeSupplier?.email : product.brand?.off_email}
              tel={hasOffice ? officeSupplier?.phone : product.brand?.off_tel}
              fax={hasOffice ? officeSupplier?.fax : product.brand?.off_fax}
            />
          )}
        </div>
      )}
    </div>
  );
}
