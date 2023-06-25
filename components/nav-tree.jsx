import React, { useState } from 'react';

const NavTree = ({ nodes }) => {
    const [expandedNodes, setExpandedNodes] = useState([]);
    const handleNodeClick = (path) => {
        if (expandedNodes.includes(path)) {
            setExpandedNodes(expandedNodes.filter((node) => node !== path));
        } else {
            setExpandedNodes([...expandedNodes, path]);
        }
    };
    const renderNode = (node) => {
        const { path, name, type } = node;
        const isExpanded = expandedNodes.includes(path);
        const isFolder = type === 'folder';
        return (
            <div key={path}>
                <div onClick={() => handleNodeClick(path)}>
                    {isFolder && (isExpanded ? '▼' : '▶')}
                    {name}
                </div>
                {isExpanded &&
                    node.children &&
                    node.children.map((child) => renderNode(child))}
            </div>
        );
    };
    return <div>{nodes.map((node) => renderNode(node))}</div>;
};
export default NavTree;