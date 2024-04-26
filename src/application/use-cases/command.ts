export type Command<Input, Output> = {
  execute: (input: Input) => Output;
};
