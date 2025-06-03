import React from "react";
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Link, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { ThemeToggle } from "../theme-toggle";
import { Avatar } from "@heroui/react";

export const Login: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { login, users } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError("Пожалуйста, выберите пользователя");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      await login(selectedUserId);
      navigate("/dashboard");
    } catch (err) {
      setError("Ошибка входа. Пожалуйста, попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-content2 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center gap-2 pb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <Icon icon="lucide:clipboard-list" className="text-primary text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-center">Инвентаризация</h1>
          <p className="text-default-500 text-center">Посуда, хоз. товары и упаковка</p>
        </CardHeader>
        <Divider />
        <CardBody className="py-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-center">Выберите пользователя</h2>
              
              <div className="flex flex-col gap-3">
                {users.map(user => (
                  <Button
                    key={user.id}
                    color={selectedUserId === user.id ? "primary" : "default"}
                    variant={selectedUserId === user.id ? "solid" : "bordered"}
                    className="h-16"
                    startContent={
                      <Avatar 
                        name={user.fullName} 
                        size="md" 
                        color={user.role === "admin" ? "primary" : "secondary"}
                      />
                    }
                    onPress={() => setSelectedUserId(user.id)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-xs text-default-500">
                        {user.role === "admin" ? "Администратор" : "Менеджер"}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="text-danger text-sm py-1 text-center">{error}</div>
            )}
            
            <Button 
              type="submit" 
              color="primary" 
              fullWidth
              isLoading={isLoading}
              size="lg"
            >
              Войти
            </Button>
          </form>
        </CardBody>
        <CardFooter className="justify-center py-4">
          <p className="text-default-500 text-sm">
            Выберите пользователя для входа в систему
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};