// UI component: renders and manages the CommandPalette feature block.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Clock, Star } from 'lucide-react';
import { clsx } from 'clsx';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
  category?: string;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentCommands');
    if (stored) {
      setRecentCommands(JSON.parse(stored));
    }
  }, []);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) {
      return commands;
    }

    const searchLower = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower) ||
        cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower))
    );
  }, [commands, search]);

  const handleExecute = useCallback(
    (command: CommandItem) => {
      command.action();
      
      // Update recent commands
      const updated = [command.id, ...recentCommands.filter(id => id !== command.id)].slice(0, 5);
      setRecentCommands(updated);
      localStorage.setItem('recentCommands', JSON.stringify(updated));
      
      onClose();
    },
    [recentCommands, onClose]
  );

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        handleExecute(filteredCommands[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, handleExecute, onClose]);

  const recentCommandsData = useMemo(() => {
    return recentCommands
      .map(id => commands.find(cmd => cmd.id === id))
      .filter(Boolean) as CommandItem[];
  }, [recentCommands, commands]);

  const commandsToShow = search.trim() ? filteredCommands : recentCommandsData.length > 0 ? recentCommandsData : commands;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-base outline-none placeholder-gray-400"
                autoFocus
              />
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div className="max-h-[400px] overflow-y-auto">
              {commandsToShow.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No commands found</p>
                </div>
              ) : (
                <>
                  {!search.trim() && recentCommandsData.length > 0 && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Recent
                    </div>
                  )}
                  {commandsToShow.map((command, index) => (
                    <button
                      key={command.id}
                      onClick={() => handleExecute(command)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                        selectedIndex === index
                          ? 'bg-blue-50 border-l-2 border-blue-500'
                          : 'hover:bg-gray-50'
                      )}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {command.icon && (
                        <div className="text-gray-400">{command.icon}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{command.label}</div>
                        {command.description && (
                          <div className="text-sm text-gray-500 truncate">{command.description}</div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↵</kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">K</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

// Hook to use command palette
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
};
