import { ConversationsChat } from 'components/conversations/chat';

export default async function Conversations() {
  return <ConversationsChat />;
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
