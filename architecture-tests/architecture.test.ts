import 'tsarch/dist/jest';

import { filesOfProject } from 'tsarch';

jest.setTimeout(30000);

describe('architecture spec', () => {
  it('application should not depend on infrastructure', async () => {
    const rule = filesOfProject()
      .inFolder('application')
      .shouldNot()
      .dependOnFiles()
      .inFolder('infrastructure');

    expect(rule).toPassAsync();
  });

  it('application domain should not depend on adapters', async () => {
    const rule = filesOfProject()
      .inFolder('application/domain')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application/adapters');

    expect(rule).toPassAsync();
  });

  it('application domain should not depend on use cases', async () => {
    const rule = filesOfProject()
      .inFolder('application/domain')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application/use-cases');

    expect(rule).toPassAsync();
  });

  it('application use cases should not depend on adapters', async () => {
    const rule = filesOfProject()
      .inFolder('application/use-cases')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application/adapters');

    expect(rule).toPassAsync();
  });

  it('application domain model should not depend on ports', async () => {
    const rule = filesOfProject()
      .inFolder('application/domain/model')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application/domain/ports');

    expect(rule).toPassAsync();
  });

  it('application domain model should not depend on domain services', async () => {
    const rule = filesOfProject()
      .inFolder('application/domain/model')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application/domain/service');

    expect(rule).toPassAsync();
  });

  it('application domain ports should not depend on domain services', async () => {
    const rule = filesOfProject()
      .inFolder('application/domain/ports')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application/domain/service');

    expect(rule).toPassAsync();
  });

  it('secondary adapters should not depend on primary adapters', async () => {
    const rule = filesOfProject()
      .inFolder('application/adapters/secondary')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application/adapters/primary');

    expect(rule).toPassAsync();
  });

  it('application code should be cycle free', async () => {
    const rule = filesOfProject().inFolder('application').should().beFreeOfCycles();

    expect(rule).toPassAsync();
  });

  it('infrastructure code should be cycle free', async () => {
    const rule = filesOfProject().inFolder('infrastructure').should().beFreeOfCycles();

    expect(rule).toPassAsync();
  });
});
