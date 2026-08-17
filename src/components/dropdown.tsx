'use client';

import { useEffect, useId, useRef, useState } from 'react';

import type { Choice, Locale } from '@/i18n/copy';
import { toggleArrayValue } from '@/domain/planner';

import { Chevron } from './icons';

export function Dropdown({
  id,
  labelText,
  options,
  selected,
  onChange,
  locale,
  multiple = true,
  searchable = false,
  emptyText,
  customInput,
  children,
}: {
  id: string;
  labelText: string;
  options: Choice[];
  selected: string[];
  onChange: (next: string[]) => void;
  locale: Locale;
  multiple?: boolean;
  searchable?: boolean;
  emptyText?: string;
  customInput?: { label: string; value: number; onChange: (value: number) => void };
  /** Extra controls rendered above the option list, e.g. the structure editor. */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionPrefix = useId();

  const visible = options.filter((option) =>
    `${option.zh} ${option.en}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const selectedLabels = selected
    .map((value) => options.find((option) => option.value === value))
    .filter(Boolean)
    .map((option) => option![locale === 'zh-CN' ? 'zh' : 'en']);
  const summary =
    selectedLabels.length === 0
      ? (emptyText ?? (locale === 'zh-CN' ? '不限' : 'Any'))
      : multiple
        ? `${selectedLabels.slice(0, 2).join('、')}${selectedLabels.length > 2 ? ` +${selectedLabels.length - 2}` : ''}`
        : selectedLabels[0];

  function choose(value: string) {
    const next = multiple ? toggleArrayValue(selected, value) : [value];
    onChange(next);
    if (!multiple) close();
  }

  function close() {
    setOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }

  function onPanelKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!visible.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + step;
        if (next < 0) return visible.length - 1;
        if (next >= visible.length) return 0;
        return next;
      });
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && activeIndex >= 0) {
      event.preventDefault();
      choose(visible[activeIndex].value);
    }
  }

  return (
    <div className="dropdown" ref={rootRef}>
      <button
        aria-controls={`${id}-panel`}
        aria-expanded={open}
        className="dropdown-trigger"
        onClick={() => {
          setActiveIndex(-1);
          setOpen((value) => !value);
        }}
        ref={triggerRef}
        type="button"
      >
        <span className="dropdown-label">
          <span>{labelText}</span>
          <strong>{summary}</strong>
        </span>
        <Chevron />
        {multiple && selected.length > 0 && (
          <span className="selection-count" aria-label={`${selected.length} selected`}>
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div
          aria-activedescendant={activeIndex >= 0 ? `${optionPrefix}-${activeIndex}` : undefined}
          aria-label={labelText}
          aria-multiselectable={multiple}
          className="dropdown-panel"
          id={`${id}-panel`}
          onKeyDown={onPanelKeyDown}
          role="listbox"
          tabIndex={-1}
        >
          {children}
          {(searchable || options.length > 8) && (
            <label className="dropdown-search">
              <span className="sr-only">{locale === 'zh-CN' ? '搜索' : 'Search'}</span>
              <input
                autoFocus
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(-1);
                }}
                placeholder={locale === 'zh-CN' ? '搜索…' : 'Search…'}
                type="search"
                value={query}
              />
            </label>
          )}
          {options.length > 0 && (
            <div className="dropdown-options">
              {visible.length ? (
                visible.map((option, index) => (
                  <label
                    className={`dropdown-option ${selected.includes(option.value) ? 'is-selected' : ''} ${
                      index === activeIndex ? 'is-active' : ''
                    }`}
                    id={`${optionPrefix}-${index}`}
                    key={option.value}
                    role="option"
                    aria-selected={selected.includes(option.value)}
                  >
                    <input
                      checked={selected.includes(option.value)}
                      onChange={() => choose(option.value)}
                      type={multiple ? 'checkbox' : 'radio'}
                    />
                    <span>{locale === 'zh-CN' ? option.zh : option.en}</span>
                    <span className="option-check" aria-hidden="true">
                      {selected.includes(option.value) ? '✓' : ''}
                    </span>
                  </label>
                ))
              ) : (
                <p className="dropdown-empty">
                  {locale === 'zh-CN' ? '没有匹配选项' : 'No matches'}
                </p>
              )}
            </div>
          )}
          {customInput && (
            <label className="dropdown-custom-input">
              <span>{customInput.label}</span>
              <span className="custom-amount">
                <b>A$</b>
                <input
                  inputMode="decimal"
                  min="20"
                  onChange={(event) =>
                    customInput.onChange(Math.max(20, Number(event.target.value) || 20))
                  }
                  type="number"
                  value={customInput.value}
                />
              </span>
            </label>
          )}
          {multiple && (
            <div className="dropdown-footer">
              <button onClick={() => onChange([])} type="button">
                {locale === 'zh-CN' ? '清除' : 'Clear'}
              </button>
              <button className="dropdown-done" onClick={close} type="button">
                {locale === 'zh-CN' ? '完成' : 'Done'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
