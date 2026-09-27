export type ApprovalRequest = {
  readonly id: string;
  readonly toolName: string;
  readonly args: Record<string, unknown>;
  readonly requestedBy: string;
  readonly status: 'pending' | 'approved' | 'rejected';
};

export type ApprovalResponse = {
  readonly requestId: string;
  readonly approved: boolean;
  readonly reason?: string;
};

export interface ApprovalWorkflow {
  submit(request: ApprovalRequest): Promise<ApprovalResponse>;
  approve(requestId: string): Promise<ApprovalResponse>;
  reject(requestId: string, reason: string): Promise<ApprovalResponse>;
}

export interface ApprovalEngine {
  submit(request: ApprovalRequest): Promise<ApprovalResponse>;
  review(requestId: string): Promise<ApprovalResponse>;
}

export function createApprovalEngine(): ApprovalEngine {
  return {
    submit: async request => ({
      requestId: request.id,
      approved: false,
    }),
    review: async requestId => ({
      requestId,
      approved: true,
    }),
  };
}
