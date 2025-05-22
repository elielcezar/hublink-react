export default function UserName({ user }) {
  return (
    <p className="text-gray-700 text-lg font-medium tracking-tight">Olá, {user?.name}</p>   
  );
}
