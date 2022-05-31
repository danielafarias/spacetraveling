import { GetStaticProps } from 'next';
import Head from 'next/head';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { FiCalendar, FiUser } from "react-icons/fi";

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  console.log(postsPagination.results);
  return (
    <>
      <Head>
        <title>Início | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        {postsPagination.results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.content}>
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>
              <div className={commonStyles.info}>
                <time><FiCalendar size={20} /> {post.first_publication_date}</time>
                <p><FiUser size={20} /> {post.data.author}</p>
              </div>
            </a>
          </Link>
        ))}
        <p className={styles.loadMore} onClick={() => console.log('click')}>
          Carregar mais posts
        </p>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');
  const postData = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date:
        new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) || null,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const data = {
    next_page: postsResponse.next_page,
    results: postData,
  };

  return {
    props: { postsPagination: data },
  };
};
