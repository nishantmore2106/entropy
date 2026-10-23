import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

export type TransitionPhase = 'idle' | 'covering' | 'revealing';

interface NavigationOptions {
  replace?: boolean;
  scroll?: boolean;
}

interface RouterContextType {
  pathname: string;
  navigate: (to: string, options?: NavigationOptions) => void;
  transitionPhase: TransitionPhase;
  isTransitioning: boolean;
  onCovered: () => void;
  onTransitionComplete: () => void;
  targetPath: string | null;
}

const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  navigate: () => {},
  transitionPhase: 'idle',
  isTransitioning: false,
  onCovered: () => {},
  onTransitionComplete: () => {},
  targetPath: null,
});

export const useRouter = () => useContext(RouterContext);

export interface RouterProviderProps {
  children: ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname || '/';
      return p.length > 1 ? p.replace(/\/+$/, '') : p;
    }
    return '/';
  });

  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle');
  const [targetPath, setTargetPath] = useState<string | null>(null);

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const isTransitioningRef = useRef(false);
  const pendingTargetRef = useRef<string | null>(null);
  const navigationOptionsRef = useRef<NavigationOptions>({ replace: false, scroll: true });
  const pendingUrlRef = useRef<string>('');
  const isPopStateRef = useRef(false);
  const failsafeTimeoutRef = useRef<number | null>(null);

  const clearFailsafe = () => {
    if (failsafeTimeoutRef.current !== null) {
      window.clearTimeout(failsafeTimeoutRef.current);
      failsafeTimeoutRef.current = null;
    }
  };

  // Called when panels have converged and completely covered the screen
  const onCovered = useCallback(() => {
    const nextPath = targetPath || pendingTargetRef.current || pathnameRef.current;
    const { replace = false, scroll = true } = navigationOptionsRef.current;

    // Update history only if this was NOT triggered by popstate
    if (!isPopStateRef.current && pendingUrlRef.current && typeof window !== 'undefined') {
      try {
        if (replace) {
          window.history.replaceState({}, '', pendingUrlRef.current);
        } else {
          window.history.pushState({}, '', pendingUrlRef.current);
        }
      } catch (err) {
        console.warn('Navigation history update warning:', err);
      }
    }

    // Switch route immediately underneath the solid opaque panels
    setPathname(nextPath);
    pathnameRef.current = nextPath;

    // Reset scroll position while completely covered
    if (scroll && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }

    // Handle hash scrolling if present
    if (pendingUrlRef.current.includes('#')) {
      const hash = pendingUrlRef.current.split('#')[1];
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    }

    setTransitionPhase('revealing');
  }, [targetPath]);

  // Called when panels have fully retracted and cleared the viewport
  const onTransitionComplete = useCallback(() => {
    clearFailsafe();
    setTransitionPhase('idle');
    setTargetPath(null);
    isTransitioningRef.current = false;
    isPopStateRef.current = false;

    // If another navigation was queued during transition, process it
    if (pendingTargetRef.current && pendingTargetRef.current !== pathnameRef.current) {
      const nextTarget = pendingTargetRef.current;
      pendingTargetRef.current = null;
      navigate(nextTarget);
    } else {
      pendingTargetRef.current = null;
    }
  }, []);

  const navigate = useCallback(
    (to: string, options: NavigationOptions = {}) => {
      const { replace = false, scroll = true } = options;

      if (typeof window === 'undefined') return;

      const url = new URL(to, window.location.href);
      const rawPath = url.pathname || '/';
      const cleanTarget = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
      const currentClean =
        pathnameRef.current.length > 1
          ? pathnameRef.current.replace(/\/+$/, '')
          : pathnameRef.current;
      const hash = url.hash;

      // In-page anchor or same-route navigation: do not replay transition
      if (cleanTarget === currentClean) {
        if (hash) {
          const el = document.getElementById(hash.replace('#', ''));
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (scroll) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      // Check prefers-reduced-motion
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const targetUrl = url.pathname + url.search + url.hash;

      if (prefersReduced) {
        clearFailsafe();
        isTransitioningRef.current = false;
        setTransitionPhase('idle');
        setTargetPath(null);
        if (replace) {
          window.history.replaceState({}, '', targetUrl);
        } else {
          window.history.pushState({}, '', targetUrl);
        }
        setPathname(cleanTarget);
        pathnameRef.current = cleanTarget;
        if (scroll) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        }
        if (hash) {
          setTimeout(() => {
            const el = document.getElementById(hash.replace('#', ''));
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
        return;
      }

      // Rapid navigation guard: queue the latest target if already transitioning
      if (isTransitioningRef.current) {
        pendingTargetRef.current = cleanTarget;
        pendingUrlRef.current = targetUrl;
        navigationOptionsRef.current = options;
        return;
      }

      // Start transition
      isTransitioningRef.current = true;
      isPopStateRef.current = false;
      navigationOptionsRef.current = options;
      pendingUrlRef.current = targetUrl;
      setTargetPath(cleanTarget);
      setTransitionPhase('covering');

      // Failsafe timer (2600ms): guarantees navigation is NEVER locked
      clearFailsafe();
      failsafeTimeoutRef.current = window.setTimeout(() => {
        console.warn('Transition failsafe triggered. Unlocking router.');
        onCovered();
        onTransitionComplete();
      }, 2600);
    },
    [onCovered, onTransitionComplete]
  );

  // Browser Back / Forward button handling
  useEffect(() => {
    const handlePopState = () => {
      const rawNewPath = window.location.pathname || '/';
      const cleanNewPath =
        rawNewPath.length > 1 ? rawNewPath.replace(/\/+$/, '') : rawNewPath;

      if (cleanNewPath === pathnameRef.current) return;

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        clearFailsafe();
        isTransitioningRef.current = false;
        setTransitionPhase('idle');
        setTargetPath(null);
        setPathname(cleanNewPath);
        pathnameRef.current = cleanNewPath;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        return;
      }

      if (isTransitioningRef.current) {
        pendingTargetRef.current = cleanNewPath;
        return;
      }

      isTransitioningRef.current = true;
      isPopStateRef.current = true;
      navigationOptionsRef.current = { replace: false, scroll: true };
      pendingUrlRef.current = window.location.pathname + window.location.search + window.location.hash;
      setTargetPath(cleanNewPath);
      setTransitionPhase('covering');

      clearFailsafe();
      failsafeTimeoutRef.current = window.setTimeout(() => {
        onCovered();
        onTransitionComplete();
      }, 2600);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearFailsafe();
    };
  }, [onCovered, onTransitionComplete]);

  return (
    <RouterContext.Provider
      value={{
        pathname,
        navigate,
        transitionPhase,
        isTransitioning: transitionPhase !== 'idle',
        onCovered,
        onTransitionComplete,
        targetPath,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  children?: ReactNode;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({
  href,
  replace,
  scroll = true,
  children,
  className = '',
  onClick,
  ...rest
}) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // If modifier keys pressed, let browser handle (e.g. open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') {
      return;
    }

    // Do not intercept external protocol links
    if (
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('http://') ||
      href.startsWith('https://')
    ) {
      return;
    }

    // Only intercept local links
    if (href.startsWith('/') || href.startsWith('#')) {
      e.preventDefault();
      navigate(href, { replace, scroll });
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};

