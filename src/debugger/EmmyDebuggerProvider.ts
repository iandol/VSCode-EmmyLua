'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, CancellationToken, ProviderResult } from 'vscode';
import { EmmyDebugConfiguration } from './types';
import { normalize } from 'path';
import { savedContext } from '../extension';

export class EmmyDebuggerProvider implements vscode.DebugConfigurationProvider {
    
    protected getSourceRoots(): string[] {
        var list = vscode.workspace.workspaceFolders!.map(f => { return f.uri.fsPath; });
        var config = <Array<string>> vscode.workspace.getConfiguration("emmylua").get("source.roots") || [];
        return list.concat(config.map(item => { return normalize(item); }));
    }

    private getExt(): string[] {
        const ext = ['.lua'];
        const associations: any = vscode.workspace.getConfiguration("files").get("associations");
        for (const key in associations) {
            if (associations.hasOwnProperty(key)) {
                const element = associations[key];
                if (element === 'lua' && key.substr(0, 2) === '*.') {
                    ext.push(key.substr(1));
                }
            }
        }
        return ext;
    }
    
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, debugConfiguration: EmmyDebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {
        debugConfiguration.extensionPath = savedContext.extensionPath;
        debugConfiguration.sourcePaths = this.getSourceRoots();
        if (!debugConfiguration.request) {
            debugConfiguration.request = "launch";
            debugConfiguration.type = "emmylua_new";
            debugConfiguration.ideConnectDebugger = true;
            debugConfiguration.host = 'localhost';
            debugConfiguration.port = 9966;
        }
        debugConfiguration.ext = this.getExt();

        return debugConfiguration;
    }

    dispose() {
    }
}