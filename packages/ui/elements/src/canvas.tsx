import type { ReactFlowProps } from '@xyflow/react';
import { Background, ReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';

// NOTE: The @xyflow/react stylesheet is NOT imported here so the package can
// be consumed from both ESM and CJS without bundler CSS handling. Consumers
// using <Canvas /> must import "@xyflow/react/dist/style.css" themselves.

type CanvasProps = ReactFlowProps & {
  children?: ReactNode;
};

const deleteKeyCode = ['Backspace', 'Delete'];

export const Canvas = ({ children, ...props }: CanvasProps) => (
  <ReactFlow
    deleteKeyCode={deleteKeyCode}
    fitView
    panOnDrag={false}
    panOnScroll
    selectionOnDrag={true}
    zoomOnDoubleClick={false}
    {...props}
  >
    <Background bgColor="var(--sidebar)" />
    {children}
  </ReactFlow>
);
