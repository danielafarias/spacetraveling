import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    };
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.data.content.heading} | spacetraveling</title>
      </Head>
      <main>
    <div className={styles.banner}>
          <img src={post.data.banner.url} alt={post.data.title} />
    </div>
        <section className={commonStyles.container}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <p><FiCalendar size={20} /> {post.first_publication_date}</p>
            <p><FiUser size={20} /> {post.data.author}</p>
            <p><FiClock size={20} /> 4 min</p>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: post.data.content.body.text }}
            className={styles.content}
          />
        </section>
      </main>
    </>
  );
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient({});
//   const posts = await prismic.getByType(TODO);

// };
export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const data = {
    first_publication_date:
      new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) || null,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,

      content: {
        heading: response.data.content[0].heading,
        body: {
          text: RichText.asHtml(response.data.content[0].body),
        },
      },
    },
  };

  return {
    props: { post: data },
  };
};
