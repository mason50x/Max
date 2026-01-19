import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors, box } from '../theme.js';
import { readFileSync, statSync } from 'fs';
import { filesize } from 'filesize';
import { basename, extname } from 'path';

// File types that can be previewed as text
const textExtensions = new Set([
  '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx',
  '.css', '.html', '.xml', '.yaml', '.yml', '.toml',
  '.sh', '.bash', '.zsh', '.py', '.rb', '.go', '.rs',
  '.c', '.cpp', '.h', '.hpp', '.java', '.swift', '.kt',
  '.sql', '.graphql', '.env', '.gitignore', '.editorconfig',
  '.log', '.csv',
]);

// File types that are images
const imageExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico', '.svg',
]);

// File types that are videos
const videoExtensions = new Set([
  '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v',
]);

// File types that are audio
const audioExtensions = new Set([
  '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a',
]);

const FilePreview = ({ path, width = '50%' }) => {
  const [content, setContent] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const stats = statSync(path);
      const ext = extname(path).toLowerCase();
      const name = basename(path);

      setFileInfo({
        name,
        ext,
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
      });

      // Try to read text files
      if (textExtensions.has(ext) && stats.size < 100000) {
        const text = readFileSync(path, 'utf8');
        setContent(text.slice(0, 2000)); // Limit preview size
      } else {
        setContent(null);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setContent(null);
      setFileInfo(null);
    }
  }, [path]);

  const getFileTypeLabel = () => {
    if (!fileInfo) return 'Unknown';
    if (fileInfo.isDirectory) return 'Directory';

    const ext = fileInfo.ext;
    if (textExtensions.has(ext)) return 'Text File';
    if (imageExtensions.has(ext)) return 'Image';
    if (videoExtensions.has(ext)) return 'Video';
    if (audioExtensions.has(ext)) return 'Audio';
    if (ext === '.pdf') return 'PDF Document';
    if (ext === '.zip' || ext === '.tar' || ext === '.gz') return 'Archive';
    if (ext === '.dmg' || ext === '.pkg') return 'Installer';
    if (ext === '.app') return 'Application';
    return 'Binary File';
  };

  return React.createElement(
    Box,
    {
      flexDirection: 'column',
      borderStyle: 'single',
      borderColor: colors.border,
      paddingX: 1,
      width: width,
      marginLeft: 1,
    },
    // Header
    React.createElement(
      Text,
      { bold: true, color: colors.accent },
      '📄 Preview'
    ),
    React.createElement(Text, null, ''),

    error
      ? React.createElement(
          Text,
          { color: colors.danger },
          'Error: ',
          error
        )
      : fileInfo
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          // File name
          React.createElement(
            Text,
            { color: colors.text, bold: true, wrap: 'truncate' },
            fileInfo.name
          ),
          React.createElement(Text, null, ''),

          // File info
          React.createElement(
            Text,
            { color: colors.textMuted },
            'Type: ',
            React.createElement(Text, { color: colors.text }, getFileTypeLabel())
          ),
          React.createElement(
            Text,
            { color: colors.textMuted },
            'Size: ',
            React.createElement(Text, { color: colors.text }, filesize(fileInfo.size))
          ),
          React.createElement(
            Text,
            { color: colors.textMuted },
            'Modified: ',
            React.createElement(
              Text,
              { color: colors.text },
              fileInfo.modified.toLocaleDateString()
            )
          ),
          React.createElement(Text, null, ''),

          // Content preview
          content
            ? React.createElement(
                Box,
                { flexDirection: 'column' },
                React.createElement(
                  Text,
                  { color: colors.textDim },
                  '─'.repeat(20)
                ),
                React.createElement(
                  Text,
                  { color: colors.textDim, wrap: 'truncate' },
                  content.split('\n').slice(0, 10).join('\n')
                ),
                content.split('\n').length > 10
                  ? React.createElement(
                      Text,
                      { color: colors.textDim },
                      '...'
                    )
                  : null
              )
            : React.createElement(
                Text,
                { color: colors.textDim, italic: true },
                'Preview not available for this file type'
              )
        )
      : React.createElement(
          Text,
          { color: colors.textDim },
          'Loading...'
        )
  );
};

export default FilePreview;
