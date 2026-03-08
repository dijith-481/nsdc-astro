import { createSignal, Show, For, onMount, onCleanup } from "solid-js";

interface Option {
  id: string | number;
  label: string;
  [key: string]: any;
}

interface DropdownProps {
  options: Option[];
  selectedId: string | number;
  onSelect: (id: string | number) => void;
  class?: string;
  buttonClass?: string;
  menuClass?: string;
  renderOption?: (option: Option) => any;
  renderSelected?: (selectedOption: Option | undefined) => any;
}

export default function Dropdown(props: DropdownProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  const selectedOption = () => props.options.find(o => o.id === props.selectedId);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  onMount(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
  });

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    }
  });

  return (
    <div class={`relative w-full ${props.class || ""}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen())}
        class={props.buttonClass || "w-full flex items-center justify-between border border-fg-0/40 px-3 py-2 bg-bg-0 text-fg-0 hover:border-primary transition-colors cursor-pointer"}
      >
        <span class="truncate">
          {props.renderSelected ? props.renderSelected(selectedOption()) : selectedOption()?.label}
        </span>
        <svg
          class={`w-4 h-4 transition-transform shrink-0 ml-2 ${isOpen() ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div class={props.menuClass || "absolute left-0 top-full mt-1 z-50 bg-bg-0 border border-fg-0/20 w-full shadow-xl max-h-60 overflow-y-auto"}>
          <For each={props.options}>
            {(option) => (
              <button
                type="button"
                onClick={() => {
                  props.onSelect(option.id);
                  setIsOpen(false);
                }}
                class={`w-full px-4 py-2 text-left hover:bg-primary hover:text-primary-fg transition-colors cursor-pointer border-b border-fg-0/5 last:border-b-0 ${
                  option.id === props.selectedId ? "bg-bg-2 font-bold" : ""
                }`}
              >
                {props.renderOption ? props.renderOption(option) : option.label}
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
