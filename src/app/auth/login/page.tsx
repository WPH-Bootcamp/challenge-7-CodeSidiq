import { AuthHero } from '@/components/auth/AuthHero';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <main className='min-h-screen grid grid-cols-1 md:grid-cols-2'>
      <AuthHero />

      <section className='bg-card flex items-center justify-center px-6 py-10 md:px-12'>
        <div className='w-full max-w-md'>
          <LoginForm />
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
