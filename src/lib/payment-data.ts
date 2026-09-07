export type ProjectPayment = {
  paymentReceivedDate: string;
  amountReceived: number;
};

export const paymentsByJobCode: Record<string, ProjectPayment> = {
  GDS149: {
    paymentReceivedDate: "2026-09-08",
    amountReceived: 840000,
  },
  GDS150: {
    paymentReceivedDate: "2026-09-08",
    amountReceived: 25000,
  },
};
