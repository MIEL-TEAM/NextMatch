import "@testing-library/jest-dom";
import Image from "next/image";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    return <Image {...props} alt="test" data-testid="next-image" />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

jest.mock("lucide-react", () => ({
  Eye: () => <div data-testid="eye-icon">👁️</div>,
  EyeOff: () => <div data-testid="eye-off-icon">🙈</div>,
  MapPin: () => <div data-testid="map-pin-icon">📍</div>,
  Navigation: () => <div data-testid="navigation-icon">🧭</div>,
  Clock: () => <div data-testid="clock-icon">🕐</div>,
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => (
      <section {...props}>{children}</section>
    ),
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => children,
  domAnimation: jest.fn(),
}));

jest.mock("@nextui-org/modal", () => ({
  Modal: ({ children, isOpen, ...props }) =>
    isOpen ? (
      <div data-testid="modal" {...props}>
        {children}
      </div>
    ) : null,
  ModalContent: ({ children, ...props }) => (
    <div data-testid="modal-content" {...props}>
      {typeof children === "function" ? children() : children}
    </div>
  ),
  ModalHeader: ({ children, ...props }) => (
    <header data-testid="modal-header" {...props}>
      {children}
    </header>
  ),
  ModalBody: ({ children, ...props }) => (
    <div data-testid="modal-body" {...props}>
      {children}
    </div>
  ),
  ModalFooter: ({ children, ...props }) => (
    <footer data-testid="modal-footer" {...props}>
      {children}
    </footer>
  ),
}));

jest.mock("@nextui-org/react", () => {
  const originalModule = jest.requireActual("@nextui-org/react");
  return {
    ...originalModule,
    Button: ({ children, onPress, isLoading, ...props }) => {
      const handleClick = (e) => {
        console.log("Button clicked, onPress:", onPress);
        if (onPress) {
          onPress(e);
        }
      };

      return (
        <button
          data-testid="nextui-button"
          onClick={handleClick}
          disabled={isLoading}
          {...props}
        >
          {isLoading ? "מאתר מיקום..." : children}
        </button>
      );
    },
  };
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is deprecated")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: componentWillReceiveProps") ||
        args[0].includes("Warning: componentWillUpdate"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
