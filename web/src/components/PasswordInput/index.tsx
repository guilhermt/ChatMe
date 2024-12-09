import { useState } from 'react';
import { IconX, IconCheck } from '@tabler/icons-react';
import { PasswordInput, Progress, Text, Popover, Box, rem } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';

interface Props {
  form: UseFormReturnType<any>;
  passwordField: string;
  label: string;
}

export const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => (
  <Text
    c={meets ? 'green.5' : 'red.8'}
    style={{ display: 'flex', alignItems: 'center' }}
    mt={7}
    size="sm"
  >
    {meets ? (
      <IconCheck style={{ width: rem(14), height: rem(14) }} />
    ) : (
      <IconX style={{ width: rem(14), height: rem(14) }} />
    )}{' '}
    <Box ml={10}>{label}</Box>
  </Text>
);

const requirements = [
  { re: /^.{8,}$/, label: 'Mínimo de 8 caracteres' },
  { re: /[0-9]/, label: 'Contém números' },
  { re: /[a-z]/, label: 'Contém letras minúsculas' },
  { re: /[A-Z]/, label: 'Contém letras maiúsculas' },
];

function getStrength(password: string) {
  let multiplier = 0;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / requirements.length) * multiplier, 10);
}

export const CustomPasswordInput = ({ form, passwordField, label }: Props) => {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [value, setValue] = useState('');

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
  ));

  const strength = getStrength(value);

  const color = strength === 100 ? 'green.5' : strength > 50 ? 'yellow' : 'red.8';

  const formProps = form.getInputProps(passwordField);

  return (
    <Popover
      opened={popoverOpened}
      position="bottom"
      width="target"
      transitionProps={{ transition: 'pop' }}
    >
      <Popover.Target>
        <div
          onFocusCapture={() => setPopoverOpened(true)}
          onBlurCapture={() => setPopoverOpened(false)}
        >
          <PasswordInput
            withAsterisk
            label={label}
            placeholder={label}
            {...formProps}
            value={value}
            onChange={(event) => {
              setValue(event.currentTarget.value);
              formProps.onChange(event);
            }}
          />
        </div>
      </Popover.Target>

      <Popover.Dropdown>
        <Progress color={color} value={strength} size={5} mb="xs" />

        {checks}
      </Popover.Dropdown>
    </Popover>
  );
};
