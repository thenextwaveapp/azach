import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="py-24 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-9xl font-bold mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button size="lg">Go Home</Button>
            </Link>
            <Link to="/new">
              <Button size="lg" variant="outline">Shop New Arrivals</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
