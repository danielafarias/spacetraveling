import { GetStaticProps } from 'next';
import Head from 'next/head';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { FiCalendar, FiUser } from "react-icons/fi";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

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
  const [results, setResults] = useState<Post[]>(postsPagination.results);
 
  function handleLoadMore(link: string) {
    fetch(link).then(response => response.json())
      .then(data => {
       data.results.map(data => {
         setResults([...results, data])
       })
      })
  }

  return (
    <>
      <Head>
        <title>Início | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        {results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.content}>
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>
              <div className={commonStyles.info}>
                <time><FiCalendar size={20} /> {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}</time>
                <p><FiUser size={20} /> {post.data.author}</p>
              </div>
            </a>
          </Link>
        ))}
        {postsPagination.next_page && <p className={styles.loadMore} onClick={() => handleLoadMore(postsPagination.next_page)}>
          Carregar mais posts
        </p>}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    lang: 'pt-BR',
    pageSize: 3,
  });

  const postsPagination = {...postsResponse}

  return {
    props: { postsPagination: postsPagination },
  };
};
