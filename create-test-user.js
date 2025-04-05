const { NhostClient } = require('@nhost/nhost-js');

const nhost = new NhostClient({
  subdomain: 'vyuokrnxjmxjimvhmskq',
  region: 'ap-south-1'
});

(async () => {
  try {
    const { error, session } = await nhost.auth.signUp({
      email: 'meghanamh212@gmail.com',
      password: 'megha@212$'
    });

    if (error) throw error;
    console.log('User created successfully:', session);
  } catch (error) {
    console.error('Error creating user:', error);
  }
})();