import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { lift, useReducedMotion } from '../../lib/motion';

export function Card({ className, title, children, hoverable = false, ...props }) {
  const reduced = useReducedMotion();
  const Root = hoverable ? motion.div : 'div';
  const hoverProps = hoverable ? { whileHover: lift(reduced) } : {};

  return (
    <Root
      className={cn(
        'bg-surface border border-line rounded-lg',
        hoverable && 'transition-shadow duration-200 hover:border-accent-300 hover:shadow-lg',
        className
      )}
      {...hoverProps}
      {...props}
    >
      {title ? (
        <>
          <Card.Header>
            <h2 className="font-display text-base font-bold text-ink tracking-tight">{title}</h2>
          </Card.Header>
          <Card.Body>{children}</Card.Body>
        </>
      ) : (
        children
      )}
    </Root>
  );
}

Card.Header = function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-b border-line', className)} {...props}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('px-6 py-4 bg-ink/[0.02] border-t border-line rounded-b-lg', className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
