import TokenDetailClient from './TokenDetailClient';

export async function generateStaticParams() {
  // 此处返回所有需要预渲染的 token id 参数
  // 如果你有接口或数据源可以获取所有 id，请在此处动态生成
  // 例如，假设知道的 id 有 "1"、"2"、"3"
  const tokenIds = ["1", "2", "3"];
  return tokenIds.map(id => ({ id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <TokenDetailClient id={params.id} />;
}