export default function Error({ msg }: { msg: string }) {
  return <div className="text-sm text-red-500">{msg}</div>;
}
