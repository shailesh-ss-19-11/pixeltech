import React, { useEffect, useState, useRef } from 'react';
import {
    Handle,
    Position,
    useUpdateNodeInternals,
    NodeResizer,
} from '@xyflow/react';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';

const ResizableRotatableNode = ({
    id,
    data,
    selected,
    sourcePosition = Position.Left,
    targetPosition = Position.Right,
    deleteNode, // Adding deleteNode as a prop,
}) => {
    console.log(data,"data")
    const rotateControlRef = useRef(null);
    const updateNodeInternals = useUpdateNodeInternals();
    const [rotation, setRotation] = useState(0);
    const [nodeStyle, setNodeStyle] = useState({
        width: 180,  // Initial width
        height: 60, // Initial height
        backgroundColor: 'white', // Initial background color
    });

    // Dynamic style based on the payment amount threshold
    useEffect(() => {
        if (data.paymentAmount > 250) {
            setNodeStyle((prevStyle) => ({
                ...prevStyle,
                backgroundColor: '#c5d7e9', // Set background to red if amount exceeds threshold
            }));
        } else {
            setNodeStyle((prevStyle) => ({
                ...prevStyle,
                backgroundColor: 'white', // Default color
            }));
        }
    }, [data.paymentAmount]); // React when paymentAmount changes

    useEffect(() => {
        if (!rotateControlRef.current) return;

        const selection = select(rotateControlRef.current);
        const dragHandler = drag().on('drag', (event) => {
            const centerX = rotateControlRef.current.parentElement.offsetWidth / 2;
            const centerY = rotateControlRef.current.parentElement.offsetHeight / 2;
            const dx = event.x - centerX;
            const dy = event.y - centerY;
            const rad = Math.atan2(dy, dx);
            const deg = rad * (180 / Math.PI);
            setRotation(deg);
            updateNodeInternals(id);
        });

        selection.call(dragHandler);

        return () => selection.on('.drag', null);
    }, [id, updateNodeInternals]);

    const handleResize = (newWidth, newHeight) => {
        setNodeStyle({
            width: newWidth,
            height: newHeight,
        });
        updateNodeInternals(id); // Force update
    };

    return (
        <div
            style={{
                transform: `rotate(${rotation}deg)`,
                width: `${nodeStyle.width}px`,
                height: `${nodeStyle.height}px`,
                border: selected ? '2px solid grey' : '1px solid black',
                borderRadius: '15px',
                padding: '10px',
                backgroundColor: nodeStyle.backgroundColor, // Dynamically set background color
                position: 'relative',
            }}
        >
            <NodeResizer
                minWidth={100}
                minHeight={50}
                isVisible={selected}
                onResize={(e, { width, height }) => handleResize(width, height)}
                lineStyle={{ borderColor: 'darkgray', borderWidth: '1px' }}
                handleStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: 'darkgray',
                    border: '1px solid white',
                }}
            />

            {/* Add the delete button inside the node */}
            {id != 0 ? (
                <button
                    style={{
                        position: 'absolute',
                        top: '4px',
                        right: '15px',
                        color: 'red',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        background: "transparent",
                        fontSize: '22px',
                    }}
                    onClick={() => data?.deleteNode(id)} // Call delete function for this specific node
                >
                    &times;
                </button>
            ) : null}

            <Handle type="target" position={Position.Top} />
            <div>
                <strong>{data.label}</strong>
                <p>Amount: ${data.paymentAmount}</p>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default ResizableRotatableNode;
