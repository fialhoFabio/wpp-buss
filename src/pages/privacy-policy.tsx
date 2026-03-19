export default async function PrivacyPolicyPage() {
  await getData();

  return (
    <div className='w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 lg:p-10'>
      <h1 className='text-2xl font-bold text-gray-900 lg:text-3xl'>Política de Privacidade</h1>
      <p className='mt-2 text-sm text-gray-500'>Última atualização: 19 de março de 2026</p>

      <div className='mt-8 space-y-6 text-sm leading-7 text-gray-700 lg:text-base'>
        <section>
          <h2 className='text-lg font-semibold text-gray-900'>1. Quem somos</h2>
          <p className='mt-2'>
            Esta Política de Privacidade descreve como a plataforma <strong>WhatBus</strong> ("Plataforma", "nós")
            coleta, usa, armazena e protege dados pessoais quando você utiliza nossos serviços para conectar contas da Meta
            (Facebook/Instagram) e gerenciar mensagens via WhatBus.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>2. Quais dados coletamos</h2>
          <p className='mt-2'>Podemos coletar as seguintes categorias de dados:</p>
          <ul className='mt-2 list-disc space-y-1 pl-6'>
            <li>Dados de cadastro e autenticação (nome, e-mail, identificadores de conta).</li>
            <li>Dados das contas conectadas da Meta (IDs de conta, páginas, números do WhatBus vinculados e permissões concedidas).</li>
            <li>Dados operacionais e de uso (logs técnicos, data/hora de acesso, endereço IP, tipo de dispositivo/navegador).</li>
            <li>Dados necessários para executar integrações, sincronizações e envio/recebimento de mensagens.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>3. Como usamos os dados e por quê</h2>
          <p className='mt-2'>Usamos os dados para:</p>
          <ul className='mt-2 list-disc space-y-1 pl-6'>
            <li>Permitir login e autenticação segura.</li>
            <li>Conectar e manter integrações com a Meta e com a WhatBus.</li>
            <li>Gerenciar mensagens e recursos solicitados pelo usuário.</li>
            <li>Prevenir fraudes, abuso, falhas técnicas e acessos não autorizados.</li>
            <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>4. Compartilhamento de dados</h2>
          <p className='mt-2'>
            Podemos compartilhar dados apenas quando necessário para operação do serviço, incluindo:
          </p>
          <ul className='mt-2 list-disc space-y-1 pl-6'>
            <li>Provedores de infraestrutura e autenticação (ex.: serviços de hospedagem e banco de dados).</li>
            <li>Plataformas da Meta para execução das funcionalidades autorizadas pelo usuário.</li>
            <li>Autoridades públicas, quando exigido por lei.</li>
          </ul>
          <p className='mt-2'>Não vendemos dados pessoais.</p>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>5. Retenção e segurança</h2>
          <p className='mt-2'>
            Mantemos os dados pelo período necessário para prestar o serviço, cumprir obrigações legais e resolver disputas.
            Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados contra acesso não autorizado,
            alteração, perda e divulgação indevida.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>6. Solicitação de exclusão de dados</h2>
          <p className='mt-2'>
            Você pode solicitar a exclusão dos seus dados pessoais e/ou desconexão das contas da Meta a qualquer momento pelo
            e-mail <a className='font-medium text-blue-600 hover:text-blue-700' href='mailto:privacidade@seudominio.com'>privacidade@seudominio.com</a>.
          </p>
          <p className='mt-2'>
            Para sua segurança, poderemos pedir informações adicionais para confirmar sua identidade antes de processar a
            solicitação.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>7. Direitos do titular</h2>
          <p className='mt-2'>
            Conforme a legislação aplicável (incluindo LGPD, quando aplicável), você pode solicitar acesso, correção,
            anonimização, portabilidade, oposição ao tratamento e eliminação de dados pessoais, observadas as hipóteses legais.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>8. Alterações nesta política</h2>
          <p className='mt-2'>
            Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre disponível nesta
            página, com a data de última atualização.
          </p>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-900'>9. Contato</h2>
          <p className='mt-2'>
            Em caso de dúvidas sobre privacidade e proteção de dados, entre em contato em
            {' '}
            <a className='font-medium text-blue-600 hover:text-blue-700' href='mailto:privacidade@seudominio.com'>privacidade@seudominio.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'Política de Privacidade',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
