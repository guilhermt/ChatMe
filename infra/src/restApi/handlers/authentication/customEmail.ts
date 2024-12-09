import { type CustomMessageTriggerEvent } from 'aws-lambda';

export const handler = async (event: CustomMessageTriggerEvent) => {
  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    event.response.emailSubject = 'ChatMe - Alteração de senha';

    const message = `Olá! <br><br> Por favor, informe o código abaixo para alterar a sua senha: <br><br> <strong><span style="font-size: 18px;">${event.request.codeParameter}</span></strong> <br><br> Obrigado!`;

    event.response.emailMessage = message;
  }

  return event;
};
