import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { username, password, companyId, companyName, recaptchaToken } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (!recaptchaToken) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification token is missing.' },
        { status: 400 }
      );
    }

    // 1. Verify the reCAPTCHA token with Google siteverify API
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('Server error: RECAPTCHA_SECRET_KEY is not configured.');
      return NextResponse.json(
        { message: 'reCAPTCHA server-side secret key is not configured.' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', recaptchaToken);

    const siteVerifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!siteVerifyRes.ok) {
      return NextResponse.json(
        { message: 'Unable to verify reCAPTCHA with Google. Please try again.' },
        { status: 502 }
      );
    }

    const verifyData = await siteVerifyRes.json() as { success: boolean; 'error-codes'?: string[] };
    if (!verifyData.success) {
      console.warn('reCAPTCHA verification failed:', verifyData['error-codes']);
      return NextResponse.json(
        { message: 'reCAPTCHA validation failed. Please check the checkbox again.' },
        { status: 400 }
      );
    }

    // 1b. Check for Embedded Super User (bypasses backend Tomcat for now)
    const superUserName = process.env.SUPER_USER_NAME || 'Admin';
    const superUserPassword = process.env.SUPER_USER_PASSWORD || '43V1n#092003';
    const superUserCompany = process.env.SUPER_USER_COMPANY || 'Super User';

    if (username === superUserName && password === superUserPassword) {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
        const backendRes = await fetch(`${apiBase}/api/authenticate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (backendRes.ok) {
          const resData = await backendRes.json();
          const token = resData.jwt || resData.token;
          return NextResponse.json({
            token,
            userId: superUserName,
            username: superUserName,
            companyName: superUserCompany,
            user: {
              userId: superUserName,
              username: superUserName,
              companyName: superUserCompany
            }
          }, { status: 200 });
        } else {
          console.warn('Backend rejected Admin authentication. Falling back to mock token.');
        }
      } catch (err) {
        console.warn('Backend unreachable for Admin authentication. Falling back to mock token:', err);
      }

      return NextResponse.json({
        token: 'mock-super-user-jwt-token-xyz',
        userId: superUserName,
        username: superUserName,
        companyName: superUserCompany,
        user: {
          userId: superUserName,
          username: superUserName,
          companyName: superUserCompany
        }
      }, { status: 200 });
    }

    // 2. Forward the login request to the Tomcat backend
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    // Use the new endpoint if companyName is provided, otherwise fall back to standard /api/authenticate
    const tomcatLoginUrl = companyName
      ? `${apiBase}/api/authenticate-by-company-name`
      : `${apiBase}/api/authenticate`;

    const backendRes = await fetch(tomcatLoginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        ...(companyId ? { companyId } : {}),
        ...(companyName ? { companyName } : {}),
        ...(companyName ? { company: companyName } : {})
      }),
    });

    const contentType = backendRes.headers.get('content-type') || '';
    const responseData = contentType.includes('application/json')
      ? await backendRes.json()
      : await backendRes.text();

    if (!backendRes.ok) {
      const message = (responseData as { message?: string })?.message ||
        (typeof responseData === 'string' ? responseData : 'Backend authentication failed');
      return NextResponse.json(
        { message },
        { status: backendRes.status }
      );
    }

    // 3. Return the successful Tomcat session data back to the client, mapping 'jwt' to 'token'
    const token = (responseData as any)?.jwt || (responseData as any)?.token;

    const mappedResponse = {
      token,
      userId: username,
      username,
      user: {
        userId: username,
        username,
      },
      ...(typeof responseData === 'object' && responseData !== null ? responseData : {}),
    };

    return NextResponse.json(mappedResponse, { status: 200 });

  } catch (error: any) {
    console.error('Error during secure login proxy:', error);
    return NextResponse.json(
      { message: `Internal server error during login: ${error?.message || error}` },
      { status: 500 }
    );
  }
}
