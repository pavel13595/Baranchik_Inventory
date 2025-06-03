import React from "react";
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Link, Divider, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth, UserRole } from "../../contexts/auth-context";
import { initialDepartments } from "../../data/initial-data";
import { ThemeToggle } from "../theme-toggle";

export const Register: React.FC = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("cook");
  const [department, setDepartment] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword || (role === "cook" && !department)) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      await register(username, password, role, role === "cook" ? department : undefined);
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Ошибка при регистрации");
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
            <Icon icon="lucide:user-plus" className="text-primary text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-center">Регистрация</h1>
          <p className="text-default-500 text-center">Создайте новый аккаунт</p>
        </CardHeader>
        <Divider />
        <CardBody className="py-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Имя пользователя"
              placeholder="Введите имя пользователя"
              value={username}
              onValueChange={setUsername}
              startContent={<Icon icon="lucide:user" className="text-default-400" />}
              isRequired
              variant="bordered"
            />
            <Input
              label="Пароль"
              placeholder="Введите пароль"
              type="password"
              value={password}
              onValueChange={setPassword}
              startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              isRequired
              variant="bordered"
            />
            <Input
              label="Подтвердите пароль"
              placeholder="Введите пароль еще раз"
              type="password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              isRequired
              variant="bordered"
            />
            
            <Select
              label="Роль"
              placeholder="Выберите роль"
              selectedKeys={[role]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as UserRole;
                setRole(selected);
                if (selected === "chef") {
                  setDepartment("");
                }
              }}
              startContent={<Icon icon="lucide:user-cog" className="text-default-400" />}
              variant="bordered"
            >
              <SelectItem key="chef" value="chef">Шеф (полный доступ)</SelectItem>
              <SelectItem key="cook" value="cook">Повар (доступ к цеху)</SelectItem>
            </Select>
            
            {role === "cook" && (
              <Select
                label="Подразделение"
                placeholder="Выберите подразделение"
                selectedKeys={department ? [department] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setDepartment(selected);
                }}
                startContent={<Icon icon="lucide:home" className="text-default-400" />}
                variant="bordered"
                isRequired
              >
                {initialDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </Select>
            )}
            
            {error && (
              <div className="text-danger text-sm py-1">{error}</div>
            )}
            
            <Button 
              type="submit" 
              color="primary" 
              fullWidth
              isLoading={isLoading}
            >
              Зарегистрироваться
            </Button>
          </form>
        </CardBody>
        <Divider />
        <CardFooter className="justify-center py-4">
          <p className="text-default-500">
            Уже есть аккаунт?{" "}
            <Link as={RouterLink} to="/login" color="primary">
              Войти
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};