import { apiRequest } from "@/lib/api";

export interface AdminProduct {
  id: number;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductPage {
  content: AdminProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

export interface AdminProductInformation {
  id?: number | string;
  productId?: number | string;
  shortDescription?: string | null;
  longDescription?: string | null;
  warranty?: string | null;
  manufacturer?: string | null;
}

export interface AdminProductSpecification {
  id?: number | string;
  productId?: number | string;
  specificationName?: string | null;
  specificationValue?: string | null;
  name?: string | null;
  key?: string | null;
  value?: string | number | null;
  description?: string | null;
}

export interface AdminProductImage {
  id?: number | string;
  productId?: number | string;
  imageUrl?: string | null;
  url?: string | null;
  src?: string | null;
  image?: string | null;
  altText?: string | null;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface AdminProductVariantAttribute {
  id?: number | string;
  variantId?: number | string;
  attributeName?: string | null;
  attributeValue?: string | null;
}

export interface AdminProductVariantPrice {
  id?: number | string;
  productVariantId?: number | string;
  mrp?: number | string | null;
  sellingPrice?: number | string | null;
  currency?: string | null;
}

export interface AdminProductVariant {
  id?: number | string;
  productId?: number | string;
  sku?: string | null;
  status?: string | null;
  stockStatus?: string | null;
  available?: boolean;
  attributes?: AdminProductVariantAttribute[] | null;
  price?: AdminProductVariantPrice | null;
  name?: string | null;
  variantName?: string | null;
  title?: string | null;
  SKU?: string | null;
  sellingPrice?: number | string | null;
  unitSellingPrice?: number | string | null;
  mrp?: number | string | null;
}

export interface AdminProductDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  information: AdminProductInformation | null;
  specifications: AdminProductSpecification[];
  images: AdminProductImage[];
  variants: AdminProductVariant[];
}

export interface AdminProductCreatePayload {
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description?: string;
}

export interface AdminProductUpdatePayload
  extends AdminProductCreatePayload {
  status: string;
}

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

interface ProductApiResponse {
  id?: number | string;
  categoryId?: number | string;
  subCategoryId?: number | string;
  brandId?: number | string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ProductPageApiResponse {
  content?: ProductApiResponse[];
  page?: number | string;
  size?: number | string;
  totalElements?: number | string;
  totalPages?: number | string;
  first?: boolean;
  last?: boolean;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getEnvelopeData<T>(response: BackendEnvelope<T>): T {
  if (response.success === false) {
    throw new Error(response.message || "The API reported a failure.");
  }

  if (response.data === undefined || response.data === null) {
    throw new Error(
      response.message || "Invalid API response: data is missing.",
    );
  }

  return response.data;
}

function normalizeProduct(value: ProductApiResponse): AdminProduct {
  return {
    id: toNumber(value.id),
    categoryId: toNumber(value.categoryId),
    subCategoryId: toNumber(value.subCategoryId),
    brandId: toNumber(value.brandId),
    name: toStringValue(value.name),
    slug: toStringValue(value.slug),
    description: toStringValue(value.description),
    status: toStringValue(value.status),
    createdAt: toStringValue(value.createdAt),
    updatedAt: toStringValue(value.updatedAt),
  };
}

function normalizePage(value: ProductPageApiResponse): AdminProductPage {
  const content = Array.isArray(value.content)
    ? value.content.map(normalizeProduct)
    : [];

  const page = toNumber(value.page);
  const size = toNumber(value.size);
  const totalElements = toNumber(value.totalElements);
  const totalPages = toNumber(value.totalPages);

  return {
    content,
    page,
    size: size || content.length,
    totalElements,
    totalPages,
    first: value.first,
    last: value.last,
  };
}

function normalizeInformation(value: unknown): AdminProductInformation | null {
  if (!isRecord(value)) return null;

  return {
    id: typeof value.id === "string" || typeof value.id === "number" ? value.id : undefined,
    productId:
      typeof value.productId === "string" || typeof value.productId === "number"
        ? value.productId
        : undefined,
    shortDescription:
      typeof value.shortDescription === "string" ? value.shortDescription : null,
    longDescription:
      typeof value.longDescription === "string" ? value.longDescription : null,
    warranty: typeof value.warranty === "string" ? value.warranty : null,
    manufacturer: typeof value.manufacturer === "string" ? value.manufacturer : null,
  };
}

function normalizeSpecifications(value: unknown): AdminProductSpecification[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => ({
    id: typeof item.id === "string" || typeof item.id === "number" ? item.id : undefined,
    productId:
      typeof item.productId === "string" || typeof item.productId === "number"
        ? item.productId
        : undefined,
    specificationName:
      typeof item.specificationName === "string" ? item.specificationName : null,
    specificationValue:
      typeof item.specificationValue === "string" ? item.specificationValue : null,
    name: typeof item.name === "string" ? item.name : null,
    key: typeof item.key === "string" ? item.key : null,
    value:
      typeof item.value === "string" || typeof item.value === "number"
        ? item.value
        : null,
    description: typeof item.description === "string" ? item.description : null,
  }));
}

function normalizeImages(value: unknown): AdminProductImage[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => ({
    id: typeof item.id === "string" || typeof item.id === "number" ? item.id : undefined,
    productId:
      typeof item.productId === "string" || typeof item.productId === "number"
        ? item.productId
        : undefined,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
    url: typeof item.url === "string" ? item.url : null,
    src: typeof item.src === "string" ? item.src : null,
    image: typeof item.image === "string" ? item.image : null,
    altText: typeof item.altText === "string" ? item.altText : null,
    isPrimary: typeof item.isPrimary === "boolean" ? item.isPrimary : undefined,
    displayOrder: typeof item.displayOrder === "number" ? item.displayOrder : undefined,
  }));
}

function normalizeVariantAttributes(value: unknown): AdminProductVariantAttribute[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => ({
    id: typeof item.id === "string" || typeof item.id === "number" ? item.id : undefined,
    variantId:
      typeof item.variantId === "string" || typeof item.variantId === "number"
        ? item.variantId
        : undefined,
    attributeName: typeof item.attributeName === "string" ? item.attributeName : null,
    attributeValue: typeof item.attributeValue === "string" ? item.attributeValue : null,
  }));
}

function normalizeVariantPrice(value: unknown): AdminProductVariantPrice | null {
  if (!isRecord(value)) return null;

  return {
    id: typeof value.id === "string" || typeof value.id === "number" ? value.id : undefined,
    productVariantId:
      typeof value.productVariantId === "string" || typeof value.productVariantId === "number"
        ? value.productVariantId
        : undefined,
    mrp:
      typeof value.mrp === "number" || typeof value.mrp === "string" ? value.mrp : null,
    sellingPrice:
      typeof value.sellingPrice === "number" || typeof value.sellingPrice === "string"
        ? value.sellingPrice
        : null,
    currency: typeof value.currency === "string" ? value.currency : null,
  };
}

function normalizeVariants(value: unknown): AdminProductVariant[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => ({
    id: typeof item.id === "string" || typeof item.id === "number" ? item.id : undefined,
    productId:
      typeof item.productId === "string" || typeof item.productId === "number"
        ? item.productId
        : undefined,
    sku: typeof item.sku === "string" ? item.sku : null,
    SKU: typeof item.SKU === "string" ? item.SKU : null,
    status: typeof item.status === "string" ? item.status : null,
    stockStatus: typeof item.stockStatus === "string" ? item.stockStatus : null,
    available: typeof item.available === "boolean" ? item.available : undefined,
    attributes: normalizeVariantAttributes(item.attributes),
    price: normalizeVariantPrice(item.price),
    name: typeof item.name === "string" ? item.name : null,
    variantName: typeof item.variantName === "string" ? item.variantName : null,
    title: typeof item.title === "string" ? item.title : null,
    sellingPrice:
      typeof item.sellingPrice === "number" || typeof item.sellingPrice === "string"
        ? item.sellingPrice
        : null,
    unitSellingPrice:
      typeof item.unitSellingPrice === "number" || typeof item.unitSellingPrice === "string"
        ? item.unitSellingPrice
        : null,
    mrp: typeof item.mrp === "number" || typeof item.mrp === "string" ? item.mrp : null,
  }));
}

function normalizeProductDetails(value: unknown): AdminProductDetails {
  if (!isRecord(value)) {
    throw new Error("Invalid product details response.");
  }

  return {
    id: toNumber(value.id),
    name: toStringValue(value.name),
    slug: toStringValue(value.slug),
    description: toStringValue(value.description),
    categoryId: toNumber(value.categoryId),
    subCategoryId: toNumber(value.subCategoryId),
    brandId: toNumber(value.brandId),
    information: normalizeInformation(value.information),
    specifications: normalizeSpecifications(value.specifications),
    images: normalizeImages(value.images),
    variants: normalizeVariants(value.variants),
  };
}

async function requestEnvelope<T>(
  path: string,
  options: Parameters<typeof apiRequest<T>>[1],
  fallbackMessage: string,
): Promise<T> {
  const response = await apiRequest<BackendEnvelope<T>>(path, options);

  if (!response.ok) {
    throw new Error(response.message || fallbackMessage);
  }

  return getEnvelopeData(response.data);
}

export async function listAdminProducts(
  page = 0,
  size = 20,
): Promise<AdminProductPage> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", "createdAt,desc");

  const data = await requestEnvelope<ProductPageApiResponse>(
    `/api/v1/products?${params.toString()}`,
    { method: "GET" },
    "Failed to load products.",
  );

  return normalizePage(data);
}

export async function getAdminProduct(productId: number): Promise<AdminProduct> {
  const data = await requestEnvelope<ProductApiResponse>(
    `/api/v1/products/${productId}`,
    { method: "GET" },
    "Failed to load product.",
  );

  return normalizeProduct(data);
}

export async function getAdminProductDetails(
  productId: number,
): Promise<AdminProductDetails> {
  const data = await requestEnvelope<unknown>(
    `/api/v1/products/${productId}/details`,
    { method: "GET" },
    "Failed to load product details.",
  );

  return normalizeProductDetails(data);
}

export async function createAdminProduct(
  payload: AdminProductCreatePayload,
): Promise<AdminProduct> {
  const data = await requestEnvelope<ProductApiResponse>(
    "/api/v1/products",
    { method: "POST", body: payload },
    "Failed to create product.",
  );

  return normalizeProduct(data);
}

export async function updateAdminProduct(
  productId: number,
  payload: AdminProductUpdatePayload,
): Promise<AdminProduct> {
  const data = await requestEnvelope<ProductApiResponse>(
    `/api/v1/products/${productId}`,
    { method: "PUT", body: payload },
    "Failed to update product.",
  );

  return normalizeProduct(data);
}

export async function deactivateAdminProduct(productId: number): Promise<void> {
  const response = await apiRequest<unknown>(
    `/api/v1/products/${productId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(response.message || "Failed to deactivate product.");
  }
}

export async function restoreAdminProduct(productId: number): Promise<AdminProduct> {
  const data = await requestEnvelope<ProductApiResponse>(
    `/api/v1/products/${productId}/restore`,
    { method: "PATCH" },
    "Failed to restore product.",
  );

  return normalizeProduct(data);
}
