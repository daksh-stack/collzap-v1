import { cn } from '../../lib/utils';

export function Card({ className, title, children, ...props }) {
  return (
    <div
      className={cn('bg-[#FBF8F2] border border-line rounded-lg', className)}
      {...props}
    >
      {title ? (
        <>
          <Card.Header>
            <h2 className="font-display text-base font-semibold text-ink tracking-tight">{title}</h2>
          </Card.Header>
          <Card.Body>{children}</Card.Body>
        </>
      ) : (
        children
      )}
    </div>
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
