import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cppFormatter.formatFile', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('Откройте C++ файл для форматирования');
			return;
		}

		const doc = editor.document;
		if (doc.languageId !== 'cpp') {
			vscode.window.showErrorMessage('Форматирование поддерживается только для C++ файлов');
			return;
		}

		const filePath = doc.fileName;
		const config = vscode.workspace.getConfiguration('cppFormatter');

		const style = config.get<string>('style') || 'LLVM';
		const tabSize = config.get<number>('tabSize') || 4;
		const useTab = config.get<string>('useTab') || 'Never';
		const columnLimit = config.get<number>('columnLimit') || 80;
		const breakBeforeBinary = config.get<string>('breakBeforeBinaryOperators') || 'None';
		const indentCase = config.get<boolean>('indentCaseLabels') ? 'true' : 'false';

		const clangStyle = `{
            BasedOnStyle: ${style},
            IndentWidth: ${tabSize},
            UseTab: ${useTab},
            ColumnLimit: ${columnLimit},
            BreakBeforeBinaryOperators: ${breakBeforeBinary},
            IndentCaseLabels: ${indentCase}
        }`.replace(/\s+/g, '');

		const command = `clang-format -i -style='${clangStyle}' "${filePath}"`;

		exec(command, (error: Error | null, stdout: string, stderr: string) => {
			if (error) {
				vscode.window.showErrorMessage(`Ошибка форматирования: ${stderr}`);
				return;
			}
			doc.save();
			vscode.window.showInformationMessage(`Файл отформатирован стилем ${style}`);
		});

	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
