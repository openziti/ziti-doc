import * as path from 'path';

export function openzitiRedocSpecs(rootDir: string) {
    return [
        { id: 'edge-client',     spec: path.resolve(rootDir, 'static/edge-client.yml') },
        { id: 'edge-management', spec: path.resolve(rootDir, 'static/edge-management.yml') },
    ];
}
