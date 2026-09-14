export const inventoryCategories = [
  "Plywood / Board",
  "Laminate",
  "Hardware",
  "Electrical",
  "Lighting",
  "Metal",
  "Acrylic",
  "Paint / Chemical",
  "Branding Material",
  "Packaging",
  "Civil Material",
  "Other",
] as const;
export const inventoryUnits = [
  "Nos",
  "Sheet",
  "Kg",
  "Mtr",
  "Sq Ft",
  "Ltr",
  "Box",
  "Set",
  "Other",
] as const;
export const storageLocations = [
  "Factory Store",
  "Production Floor",
  "Site",
  "Other",
] as const;
export const materialRequesters = [
  "Production",
  "Project Manager",
  "Site Execution",
  "Management",
] as const;
export const materialRequestStatuses = [
  "Requested",
  "Checking Stock",
  "Partially Available",
  "Available",
  "Shortage Sent to Purchase",
  "Issued",
  "Closed",
] as const;
export const materialIssueRecipients = [
  "Production",
  "Site",
  "Project Team",
  "Other",
] as const;

export type InventoryItem = {
  id: string;
  itemName: string;
  category: (typeof inventoryCategories)[number];
  unit: (typeof inventoryUnits)[number];
  storageLocation: (typeof storageLocations)[number];
  quantityOnHand: number;
  reorderLevel: number;
  notes: string;
};
export type StockAllocation = {
  inventoryItemId: string;
  requestedQty: number;
  availableQty: number;
  allocatedQty: number;
  issuedQty: number;
};
export type MaterialRequest = {
  id: string;
  jobCode: string;
  requestTitle: string;
  requestedBy: (typeof materialRequesters)[number];
  requestDate: string;
  requiredDate: string;
  materialListLink: string;
  status: (typeof materialRequestStatuses)[number];
  notes: string;
  allocations: StockAllocation[];
};
export type StockReceipt = {
  id: string;
  jobCode: string;
  purchaseRequestId: string;
  supplierPoReference: string;
  receiptDate: string;
  receivedBy: string;
  inventoryItemId: string;
  quantityReceived: number;
  storageLocation: (typeof storageLocations)[number];
  notes: string;
};
export type StockIssue = {
  id: string;
  jobCode: string;
  materialRequestId: string;
  inventoryItemId: string;
  issueDate: string;
  issuedTo: (typeof materialIssueRecipients)[number];
  quantityIssued: number;
  notes: string;
};

const drive = "https://drive.google.com/";
export const inventoryItems: InventoryItem[] = [
  {
    id: "INV-001",
    itemName: "Fictional 18 mm Plywood",
    category: "Plywood / Board",
    unit: "Sheet",
    storageLocation: "Factory Store",
    quantityOnHand: 42,
    reorderLevel: 10,
    notes: "Prototype stock.",
  },
  {
    id: "INV-002",
    itemName: "Fictional White Laminate",
    category: "Laminate",
    unit: "Sheet",
    storageLocation: "Factory Store",
    quantityOnHand: 26,
    reorderLevel: 8,
    notes: "Prototype stock.",
  },
  {
    id: "INV-003",
    itemName: "Fictional LED Strip",
    category: "Lighting",
    unit: "Mtr",
    storageLocation: "Production Floor",
    quantityOnHand: 18,
    reorderLevel: 20,
    notes: "Low-stock demonstration.",
  },
  {
    id: "INV-004",
    itemName: "Fictional Drawer Channel",
    category: "Hardware",
    unit: "Set",
    storageLocation: "Factory Store",
    quantityOnHand: 15,
    reorderLevel: 5,
    notes: "Prototype stock.",
  },
  {
    id: "INV-005",
    itemName: "Fictional MS Square Pipe",
    category: "Metal",
    unit: "Mtr",
    storageLocation: "Production Floor",
    quantityOnHand: 55,
    reorderLevel: 15,
    notes: "Prototype stock.",
  },
  {
    id: "INV-006",
    itemName: "Fictional Packing Material",
    category: "Packaging",
    unit: "Box",
    storageLocation: "Factory Store",
    quantityOnHand: 9,
    reorderLevel: 10,
    notes: "Low-stock demonstration.",
  },
];

export const materialRequests: MaterialRequest[] = [
  {
    id: "MR-149-01",
    jobCode: "GDS149",
    requestTitle: "Fictional completed production material request",
    requestedBy: "Production",
    requestDate: "2026-08-18",
    requiredDate: "2026-08-24",
    materialListLink: drive,
    status: "Closed",
    notes: "Fictional issued and closed example.",
    allocations: [
      {
        inventoryItemId: "INV-001",
        requestedQty: 10,
        availableQty: 10,
        allocatedQty: 10,
        issuedQty: 10,
      },
    ],
  },
  {
    id: "MR-150-01",
    jobCode: "GDS150",
    requestTitle: "Fictional fixture production material request",
    requestedBy: "Production",
    requestDate: "2026-09-08",
    requiredDate: "2026-09-16",
    materialListLink: drive,
    status: "Partially Available",
    notes: "Fictional partial availability and shortage example.",
    allocations: [
      {
        inventoryItemId: "INV-003",
        requestedQty: 30,
        availableQty: 18,
        allocatedQty: 18,
        issuedQty: 0,
      },
      {
        inventoryItemId: "INV-004",
        requestedQty: 10,
        availableQty: 10,
        allocatedQty: 10,
        issuedQty: 4,
      },
    ],
  },
];

export const stockReceipts: StockReceipt[] = [
  {
    id: "REC-150-01",
    jobCode: "GDS150",
    purchaseRequestId: "PR-0054",
    supplierPoReference: "",
    receiptDate: "2026-09-08",
    receivedBy: "Prototype Store Person",
    inventoryItemId: "INV-004",
    quantityReceived: 10,
    storageLocation: "Factory Store",
    notes: "Fictional physical receipt.",
  },
];
export const stockIssues: StockIssue[] = [
  {
    id: "ISS-149-01",
    jobCode: "GDS149",
    materialRequestId: "MR-149-01",
    inventoryItemId: "INV-001",
    issueDate: "2026-08-24",
    issuedTo: "Production",
    quantityIssued: 10,
    notes: "Fictional completed issue.",
  },
];
