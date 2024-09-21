import React, { useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import ResizableRotatableNode from './ResizableRotatableNode';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
    customNode: ResizableRotatableNode,
};

const getRandomValue = () => Math.floor(Math.random() * 500);

const nodeList = [
    {
        id: '1',
        data: { label: 'Google Pay', paymentAmount: 200, providerType: 'Digital Wallet', status: 'active' },
        position: { x: getRandomValue(), y: getRandomValue() },
        type: 'customNode',
    },
    {
        id: '2',
        data: { label: 'Stripe', paymentAmount: 350, providerType: 'Payment Gateway', status: 'inactive' },
        position: { x: getRandomValue(), y: getRandomValue() },
        type: 'customNode',
    },
    {
        id: '3',
        data: { label: 'Apple Pay', paymentAmount: 500, providerType: 'Digital Wallet', status: 'active' },
        position: { x: getRandomValue(), y: getRandomValue() },
        type: 'customNode',
    },
    {
        id: '4',
        data: { label: 'PayPal', paymentAmount: 400, providerType: 'Digital Wallet', status: 'active' },
        position: { x: getRandomValue(), y: getRandomValue() },
        type: 'customNode',
    },
    {
        id: '5',
        data: { label: 'Amazon Pay', paymentAmount: 150, providerType: 'Digital Wallet', status: 'inactive' },
        position: { x: getRandomValue(), y: getRandomValue() },
        type: 'customNode',
    },
    {
        id: '6',
        data: { label: 'Square', paymentAmount: 300, providerType: 'Payment Gateway', status: 'active' },
        position: { x: getRandomValue(), y: getRandomValue() },
        type: 'customNode',
    },
];

const ReactFlowComponent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([{
        id: '0',
        data: { label: 'Payment Initialize', paymentAmount: 300 },
        position: { x: 250, y: 50 },
        type: 'customNode',
    }]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [history, setHistory] = useState({ nodes: [], edges: [] });
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [selectedId, setSelectedId] = useState('');
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());
    const [highlightedEdges, setHighlightedEdges] = useState(new Set());
    const [tooltip, setTooltip] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // Load saved workflow from local storage on component mount
        const savedWorkflow = localStorage.getItem('workflow');
        if (savedWorkflow) {
            const { nodes, edges } = JSON.parse(savedWorkflow);
            const newNode = nodes.map(item => ({
                ...item,
                data: {
                    ...item.data,
                    deleteNode: () => deleteNode(item.id),
                },
            }));
            setNodes(newNode);
            setEdges(edges);
        }
    }, []);

    const updateHistory = (newNodes, newEdges) => {
        const newHistory = { nodes: newNodes, edges: newEdges };
        setHistory((prev) => {
            const updatedHistory = [...prev.nodes.slice(0, historyIndex + 1), newHistory];
            return {
                nodes: updatedHistory,
                edges: [...prev.edges.slice(0, historyIndex + 1), newEdges],
            };
        });
        setHistoryIndex((prev) => prev + 1);
    };

    const highlightConnections = (selectedNodeId) => {
        const newHighlightedNodes = new Set();
        const newHighlightedEdges = new Set();

        edges.forEach(edge => {
            if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
                newHighlightedEdges.add(edge.id); // Use edge id for highlighting
                newHighlightedNodes.add(edge.source);
                newHighlightedNodes.add(edge.target);
            }
        });

        setHighlightedNodes(newHighlightedNodes);
        setHighlightedEdges(newHighlightedEdges);
    };

    const onConnect = useCallback(
        (params) => {
            if (params.source === '0' || params.target === '0') {
                const newEdges = addEdge(params, edges);
                setEdges(newEdges);
                updateHistory(nodes, newEdges);
            } else {
                setTooltip('Edges can only be connected to the Payment Initialize node!');
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 3000);
            }
        },
        [edges, nodes]
    );

    const deleteNode = useCallback(
        (nodeId) => {
            const updatedNodes = nodes.filter((node) => node.id !== nodeId);
            const updatedEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
            setNodes(updatedNodes);
            setEdges(updatedEdges);
            updateHistory(updatedNodes, updatedEdges);
        },
        [edges, nodes]
    );

    const handleNodes = (e) => {
        const selectedId = e.target.value;
        const selectedNode = nodeList.find((item) => item.id === selectedId);

        if (selectedNode && !nodes.some((node) => node.id === selectedNode.id)) {
            const newNode = {
                ...selectedNode,
                data: {
                    ...selectedNode.data,
                    deleteNode: () => deleteNode(selectedNode.id),
                },
            };
            const updatedNodes = [...nodes, newNode];
            setNodes(updatedNodes);
            updateHistory(updatedNodes, edges);
        }
        setSelectedId(selectedId);

        // Highlight connected nodes and edges
        highlightConnections(selectedId);
    };

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const previousState = history.nodes[historyIndex - 1];
            setNodes(previousState.nodes);
            setEdges(previousState.edges);
            setHistoryIndex((prev) => prev - 1);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.nodes.length - 1) {
            const nextState = history.nodes[historyIndex + 1];
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            setHistoryIndex((prev) => prev + 1);
        }
    }, [history, historyIndex]);

    const saveWorkflow = () => {
        const workflow = { nodes, edges };
        localStorage.setItem('workflow', JSON.stringify(workflow));
        alert('Workflow saved!');
    };

    const loadWorkflow = () => {
        const savedWorkflow = localStorage.getItem('workflow');
        if (savedWorkflow) {
            const { nodes, edges } = JSON.parse(savedWorkflow);
            setNodes(nodes);
            setEdges(edges);
            alert('Workflow loaded!');
        } else {
            alert('No saved workflow found.');
        }
    };

    const exportWorkflow = () => {
        const workflow = { nodes, edges };
        const json = JSON.stringify(workflow);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflow.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importWorkflow = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedWorkflow = JSON.parse(e.target.result);
                const newNodes = importedWorkflow.nodes.map(item => ({
                    ...item,
                    data: {
                        ...item.data,
                        deleteNode: () => deleteNode(item.id),
                    },
                }));
                setNodes(newNodes);
                setEdges(importedWorkflow.edges);
                alert('Workflow imported successfully!');
            };
            reader.readAsText(file);
        }
    };

    return (
        <>
            <div className="d-flex align-items-start container mt-4">
                <div className="app">
                    <p>Please Select Payment Provider</p>
                    <select
                        className="form-select"
                        name="nodeName"
                        value={selectedId}
                        onChange={handleNodes}
                    >
                        <option value="">Select</option>
                        {nodeList.map((item) => (
                            <option value={item.id} key={item.id}>
                                {item.data.label}
                            </option>
                        ))}
                    </select>
                    <div className="row gap-2 mt-3">
                        <div className='d-flex gap-2'>
                            <button className='btn btn-sm border' onClick={undo} disabled={historyIndex <= 0}>Undo</button>
                            <button className='btn btn-sm border' onClick={redo} disabled={historyIndex >= history.nodes.length - 1}>Redo</button>
                        {/* </div>
                        <div className="d-flex gap-2"> */}
                            <button className='btn btn-sm border' onClick={saveWorkflow}>Save Workflow</button>
                            <button className='btn btn-sm border' onClick={loadWorkflow}>Load Workflow</button>
                        </div>
                        <div className="d-flex gap-2">
                            <button className='btn btn-sm border' onClick={exportWorkflow}>Export Workflow</button>
                            <input type="file" onChange={importWorkflow} accept=".json" />
                        </div>
                    </div>
                </div>

                <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes.map(node => ({
                                ...node,
                                style: { border: highlightedNodes.has(node.id) ? '2px solid #007bff' : '1px solid #ccc' }
                            }))}
                            edges={edges.map(edge => ({
                                ...edge,
                                style: { stroke: highlightedEdges.has(edge.id) ? '#007bff' : '#ddd' }
                            }))}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                        >
                            <Controls />
                            <MiniMap />
                            <Background variant="dots" gap={12} size={1} />
                        </ReactFlow>
                    </ReactFlowProvider>

                    {showTooltip && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '10px',
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                border: '1px solid #f5c6cb',
                                borderRadius: '5px',
                                zIndex: 1000,
                            }}
                        >
                            {tooltip}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ReactFlowComponent;
