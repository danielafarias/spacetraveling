import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  first_publication_date: string;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    author: string;
    banner: {
      url: string;
    };

    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  return (
    <>
      {router.isFallback ? (
        <p>Carregando...</p>
      ) : (
        <>
          <Head>
            <title>{post.data.title} | spacetraveling</title>
          </Head>
          <main>
            <div className={styles.banner}>
              <img src={post.data.banner.url} alt={post.data.title} />
            </div>
            <section className={commonStyles.container}>
              <h1 className={styles.title}>{post.data.title}</h1>
              <div className={commonStyles.info}>
                <p>
                  <FiCalendar size={20} />{' '}
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </p>
                <p>
                  <FiUser size={20} /> {post.data.author}
                </p>
                <p>
                  <FiClock size={20} /> 4 min
                </p>
              </div>
              {post.data.content.map(content => (
                <div>
                  <h2>{content.heading}</h2>
                  <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </div>
              ))}
            </section>
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const data = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post: data },
  };
};
