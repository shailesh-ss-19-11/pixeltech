// NodeEnums.ts
export enum NodeId {
    Node1 = 1,
    Node2,
    Node3,
}

export enum Position {
    TopLeft = 0,
    TopRight,
    BottomLeft,
    BottomRight,
}

export enum LabelType {
    Start = "Start Node",
    Process = "Process Node",
    End = "End Node"
}

// This makes the file a module, even if you don't import anything
export { };

export interface NodePosition {
    x: number;
    y: number;
}

export interface NodeData {
    label: string;
}

export interface PaymentProvider {
    id: string;  // Keeping id as a string to match your current list
    position: NodePosition;
    data: NodeData;
}
