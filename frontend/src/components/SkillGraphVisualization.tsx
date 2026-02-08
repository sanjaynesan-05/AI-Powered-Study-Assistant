import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SkillNode {
    id: string;
    status: 'mastered' | 'current' | 'locked';
}

interface SkillGraphProps {
    skillDependencies: Record<string, string[]>;
    masteredSkills: string[];
    currentSkill: string;
    learningPath: string[];
}

export const SkillGraphVisualization: React.FC<SkillGraphProps> = ({
    skillDependencies,
    masteredSkills,
    currentSkill,
    learningPath
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !skillDependencies) return;

        // Clear previous graph
        d3.select(svgRef.current).selectAll('*').remove();

        const width = 800;
        const height = 600;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Create nodes and links
        const nodes: SkillNode[] = Object.keys(skillDependencies).map(skill => ({
            id: skill,
            status: masteredSkills.includes(skill) ? 'mastered' :
                skill === currentSkill ? 'current' : 'locked'
        }));

        const links = Object.entries(skillDependencies).flatMap(([target, sources]) =>
            sources.map(source => ({ source, target }))
        );

        // Create force simulation
        const simulation = d3.forceSimulation(nodes as any)
            .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        // Draw links
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2);

        // Draw nodes
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 20)
            .attr('fill', (d: SkillNode) =>
                d.status === 'mastered' ? '#10b981' :
                    d.status === 'current' ? '#3b82f6' : '#e5e7eb'
            )
            .attr('stroke', (d: SkillNode) =>
                d.status === 'current' ? '#1d4ed8' : 'none'
            )
            .attr('stroke-width', 3);

        // Add labels
        const labels = svg.append('g')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .text((d: SkillNode) => d.id)
            .attr('font-size', 12)
            .attr('dx', 25)
            .attr('dy', 4);

        // Update positions on simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);

            labels
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y);
        });

    }, [skillDependencies, masteredSkills, currentSkill]);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">🧠 Skill Dependency Graph</h3>

            <div className="mb-4 flex space-x-4 text-sm">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span>Mastered</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 ring-2 ring-blue-700"></div>
                    <span>Current</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                    <span>Locked</span>
                </div>
            </div>

            {learningPath.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Learning Path:</p>
                    <p className="text-sm text-blue-700">{learningPath.join(' → ')}</p>
                </div>
            )}

            <svg ref={svgRef} className="border border-gray-200 rounded"></svg>
        </div>
    );
};
