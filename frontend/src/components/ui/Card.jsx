import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("bg-white rounded-lg shadow border border-gray-100", className)} {...props}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg", className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
