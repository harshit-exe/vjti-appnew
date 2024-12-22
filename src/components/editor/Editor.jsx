"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Bold, Italic, Heading1, Heading2, Heading3, List, Users, Share2 } from 'lucide-react';
import SlashCommandMenu from './SlashCommandMenu';
import { useState, useEffect, useMemo } from 'react';
import { useAI } from '@/hooks/useAI';

const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D'];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const Editor = () => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { performAIAction, isLoading, error } = useAI();
  const [status, setStatus] = useState('Connecting...');
  const [userCount, setUserCount] = useState(1);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(() => new WebrtcProvider('realtime-editor-room', ydoc), [ydoc]);
  const persistence = useMemo(() => new IndexeddbPersistence('realtime-editor-room', ydoc), [ydoc]);

  useEffect(() => {
    persistence.once('synced', () => {
      console.log('Content loaded from IndexedDB');
    });

    return () => {
      provider.disconnect();
      persistence.destroy();
    };
  }, [provider, persistence]);

  const editor = useEditor({
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: 'Anonymous User',
          color: getRandomColor(),
        },
      }),
    ],
    content: "<p>Hello World! 🌎️</p>",
    onUpdate: ({ editor }) => {
      const { state } = editor;
      const { selection } = state;
      const { $anchor } = selection;
      const currentLineText = $anchor.nodeBefore?.textContent || '';

      if (currentLineText.endsWith('/')) {
        const { top, left } = editor.view.coordsAtPos($anchor.pos);
        const editorElement = document.querySelector('.ProseMirror');
        const editorRect = editorElement.getBoundingClientRect();
        
        setMenuPosition({
          top: top - editorRect.top + 24,
          left: left - editorRect.left
        });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    },
  });

  useEffect(() => {
    if (editor) {
      setStatus('Connected');
    }
  }, [editor]);

  useEffect(() => {
    const handlePeerChange = () => {
      setUserCount(provider.awareness.getStates().size);
    };

    provider.awareness.on('change', handlePeerChange);

    return () => {
      provider.awareness.off('change', handlePeerChange);
    };
  }, [provider.awareness]);

  const handleAIAction = async (action) => {
    if (!editor) return;

    const content = editor.getHTML();
    let result;

    if (action === 'enhance') {
      const template = prompt('Enter the writing style (e.g., "formal", "casual", "technical"):');
      const creativity = parseFloat(prompt('Enter the creativity level (0.0 to 1.0):') || '0.5');
      
      if (template && !isNaN(creativity) && creativity >= 0 && creativity <= 1) {
        result = await performAIAction(content, action, template, creativity);
      } else {
        alert('Invalid input. Please try again.');
        return;
      }
    } else {
      result = await performAIAction(content, action);
    }

    if (result) {
      editor.commands.setContent(result);
    }
  };

  const shareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <Toolbar editor={editor} />
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Users size={20} className="mr-2" />
            <span>{userCount} user{userCount !== 1 ? 's' : ''} connected</span>
          </div>
          <button onClick={shareLink} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            <Share2 size={20} className="mr-2" />
            Share Link
          </button>
        </div>
      </div>
      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-4">
        {status}
      </div>
      <EditorContent className="min-h-[300px] max-h-[600px] overflow-y-auto bg-white rounded-lg p-5 my-5 border shadow-sm" editor={editor} />
      {showSlashMenu && (
        <div style={{
          position: 'absolute',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          zIndex: 50
        }}>
          <SlashCommandMenu editor={editor} onAIAction={handleAIAction} />
        </div>
      )}
      {isLoading && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-white">Processing AI request...</div>
      </div>}
      {error && <div className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded">{error}</div>}
    </div>
  );
};

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const buttonStyle = {
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div className="flex gap-2 p-2 bg-white border-b-2 border-gray-200 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        style={buttonStyle}
        className="toolbar-button"
      >
        <Bold size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        style={buttonStyle}
        className="toolbar-button"
      >
        <Italic size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
        style={buttonStyle}
        className="toolbar-button"
      >
        <Heading1 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
        style={buttonStyle}
        className="toolbar-button"
      >
        <Heading2 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
        style={buttonStyle}
        className="toolbar-button"
      >
        <Heading3 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={buttonStyle}
        className="toolbar-button"
      >
        <List size={20} />
      </button>
    </div>
  );
};

export default Editor;

