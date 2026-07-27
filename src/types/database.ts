/**
 * Database types for ENDEVIS InvoiceFlow.
 *
 * The `Database` type is generated from the live schema via:
 *   supabase gen types typescript --local > src/types/database.generated.ts
 *
 * Convenience row/enum aliases are re-exported below so call sites stay stable
 * even if the generator output changes.
 */
export type { Database, Json } from "./database.generated";
import type { Database } from "./database.generated";

type PublicSchema = Database["public"];
type Tables = PublicSchema["Tables"];
type Enums = PublicSchema["Enums"];

/* Enums */
export type AppRole = Enums["app_role"];
export type InvoiceStatus = Enums["invoice_status"];
export type QuotationStatus = Enums["quotation_status"];
export type ProductStatus = Enums["product_status"];
export type DocumentType = Enums["document_type"];
export type ProjectStatus = Enums["project_status"];
export type DefectPriority = Enums["defect_priority"];

/* Row aliases */
export type Profile = Tables["profiles"]["Row"];
export type Customer = Tables["customers"]["Row"];
export type Product = Tables["products"]["Row"];
export type Invoice = Tables["invoices"]["Row"];
export type InvoiceItem = Tables["invoice_items"]["Row"];
export type Quotation = Tables["quotations"]["Row"];
export type Notification = Tables["notifications"]["Row"];
export type CompanySettings = Tables["company_settings"]["Row"];
export type Project = Tables["projects"]["Row"];
export type DiaryEntry = Tables["construction_diary_entries"]["Row"];
export type Defect = Tables["defects"]["Row"];
export type HandoverProtocol = Tables["handover_protocols"]["Row"];
export type ProjectCost = Tables["project_costs"]["Row"];
