import Head from 'next/head';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Table from '@/components/Table';

export default function Page() {
  useForm();

  const { data: session, status } = useSession();
  const [dataResponse, setDataResponse] = useState([]);
  const [userResponse, setUserResponse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameSortOrder, setNameSortOrder] = useState('asc');
  const [contentLoading, setContentLoading] = useState(false);

  const handleEditStudent = (studentId) => {
    setEditingId(studentId);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSearchChange = (item) => {
    setSearchTerm(item.target.value);
  };

  const handleNameSort = () => {
    if (nameSortOrder === 'asc') {
      setNameSortOrder('desc');
    } else {
      setNameSortOrder('asc');
    }
  };

  useEffect(() => {
    const sortStudentsByName = (students, order) => {
      if (order === 'asc') {
        return students.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        return students.sort((a, b) => b.name.localeCompare(a.name));
      }
    };
    const sortedStudents = sortStudentsByName(dataResponse, nameSortOrder);
    const filteredStudents = sortedStudents.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filteredStudents);
  }, [dataResponse, searchTerm, nameSortOrder]);

  const handleUpdateStudent = async (editedStudent) => {
    setContentLoading(true);
    const response = await fetch('/api/updatestudents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedStudent),
    });
    if (response.ok) {
      // I had to move getpagedata out of useeffect so i could call it here (Spr 2023 Team).
      await getPageData();
      setEditingId(null);
    } else {
      console.error('Error updating the student');
    }
    setContentLoading(false);
  };

  const handleDeleteStudent = async (studentID) => {
    setContentLoading(true);
    const response = await fetch('/api/deletestudent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: studentID }),
    });
    if (response.ok) {
      // I had to move getpagedata out of useeffect so I could call it here (Spr 2023 Team).
      await getPageData();
    } else {
      console.error('Error deleting the batch');
    }
    setContentLoading(false);
  };

  // API DATA ACCESS
  const getPageData = async () => {
    setContentLoading(true);
    const apiUrlEndpoint = process.env.NEXT_PUBLIC_API_URL + `getstudentsdata`;
    const response = await fetch(apiUrlEndpoint);
    const res = await response.json();
    setDataResponse(res.students);
    setContentLoading(false);
  };

  useEffect(() => {
    getPageData();
  }, []);

  useEffect(() => {
    const sortStudentsByName = (students) => {
      return students.sort((a, b) => a.name.localeCompare(b.name));
    };
    const sortedStudents = sortStudentsByName(dataResponse);
    const filteredStudents = sortedStudents.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filteredStudents);
  }, [dataResponse, searchTerm]);

  var result;

  // API DATA ACCESS
  const getUserData = async () => {
    const apiUrlEndpoint = process.env.NEXT_PUBLIC_API_URL + `getuserdata`;
    const postData = {
      method: "Post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email
      }),
    };
    const response = await fetch(apiUrlEndpoint, postData);
    const res = await response.json();
    setUserResponse(res.users[0]);
    setLoading(false);
    result = res.users[0];
  };

  // useEffect(() => {
  //   getUserData();
  // }, [session]);
  useEffect(() => {
    getUserData();
  });
  
  result = userResponse;

  const studentsColumns = [
    {
      name: 'Id',
      width: '4%',
      accessor: 'id',
    },
    {
      name: 'Email',
      accessor: 'email',
    },
    {
      name: 'Name',
      accessor: 'name',
    },
    {
      name: 'Phone Number',
      accessor: 'phone_number',
    },
    {
      name: 'Alt Phone Number',
      accessor: 'alt_ph_num',
    },
    {
      name: 'City',
      accessor: 'city',
    },
    {
      name: 'State',
      accessor: 'state',
    },
    {
      name: 'Gender',
      accessor: 'gender',
      type: 'enum',
      // availableValues: ['M', 'F', 'Other'],
      availableValues: ['Female', 'Male', 'Other'],
    },
    {
      name: 'Birthdate',
      accessor: 'age',
    },
    {
      name: 'Education History',
      accessor: 'edu_qualifications',
    },
    {
      name: 'Employment Status',
      accessor: 'employment_status',
    },
    {
      name: 'Learning Goals',
      accessor: 'objectives',
    },
    {
      name: 'Trainer Name',
      accessor: 'trainer_name',
    },
    {
      name: 'First Choice',
      accessor: 'first_choice',
    },
    {
      name: 'Second Choice',
      accessor: 'second_choice',
    },
    {
      name: 'Third Choice',
      accessor: 'third_choice',
    },
    {
      name: 'Visual Acuity',
      accessor: 'visual_acuity',
    },
    {
      name: 'Percent Loss',
      accessor: 'percent_loss',
    },
    {
      name: 'Impairment History',
      accessor: 'impairment_history',
    },
    {
      name: 'Reference',
      accessor: 'source',
    },
    {
      name: 'Registration Date',
      accessor: 'registration_date',
      type: 'date',
    },
  ];

  /*-------------- BEGIN AUTHENTICATION FAILURE ------------*/
  if (loading) {
    return <p>Loading...</p>;
  }
  if (status === 'unauthenticated' || result[0].isactive === 0) {
    return (
      <div className='autherrorcontainer'>
        <Image alt={'VisionAid logo'} src={'/images/logo-mainsite.png'} height={100} width={150} />
        <span className='autherrortext'>
          Access denied.&nbsp;
          <Link href='/' className='autherrorlink'>
            Please sign in with an active account.
          </Link>
        </span>
      </div>
    );
  } else {
    if ((result[0].role === 'MANAGEMENT' || result[0].role === 'PM' || result[0].role === 'ADMINISTRATOR')) {
      /*-------------- END AUTHENTICATION FAILURE ------------*/

      return (
        <>
          <div className={styles.mynavbar}>
            <Navbar user_role={result[0].role} className={styles.navstudents} />
          </div>
          <div className={styles.container}>
            <Head>
              <title>VisionAid</title>
              <meta
                name='description'
                content='A nonprofit, advocating on behalf of persons with vision issues of any type' />
              <meta name='theme-color' content='#ffffff' />
              <link rel='icon' href='/favicon.ico' />
              <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel='manifest' href='/manifest.json' />

              <link rel='preconnect'
                href='https://fonts.gstatic.com'
                crossOrigin="true" />

              {/* <link rel='preload'
                as='style'
                href='https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap' />
              <link rel='stylesheet'
                href='https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap'
                media='print'
                onLoad="this.media='all'" />
              <noscript>
                <link rel='stylesheet'
                  href='https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap' />
              </noscript> */}
            </Head>
            <main className={styles.mainstudents}>
              {contentLoading ?
                <div className={styles.overlay}>
                  <span className={styles.customLoader}></span>
                </div>
                : <></>
              }
              <p className={styles.subtitle}>
                All Students

                {/* ---------- CSV DOWNLOAD BUTTON ---------------- */}
                {/* <Link legacyBehavior className={styles.csvbutton} href={"https://visionaid.dreamhosters.com/csv/students.php"}> */}
                <Link legacyBehavior className={styles.csvbutton} href={"https://visionaid.dreamhosters.com/csv"}>
                  <a target="_blank">Students CSV</a>
                </Link>
              </p>
              <div className={styles.gridcourses}>
                <Table columns={studentsColumns} tableData={dataResponse} isDelete={true} onDeleteClick={handleDeleteStudent} isEditable={true} isStudent={true} onEditSave={handleUpdateStudent} Title={'Students List'} />
              </div>
              <footer className={styles.footer}>
                <Link
                  href='privacypolicy.html'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Privacy
                </Link>&nbsp;|&nbsp;
                <Link
                  href='termsofservice.html'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Terms
                </Link>&nbsp;|&nbsp;
                <a
                  href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <span className={styles.logo}>
                    Powered by{"' '"}
                    <Image src='/vercel.svg'
                      alt='Vercel Logo'
                      width={72}
                      height={16} />
                  </span>
                </a>
              </footer>
            </main>
          </div>
        </>
      );

      /*-------------- BEGIN AUTHORIZATION FAILURE -------------*/
    } else {
      if ((result.length === 0)) {
        return (
          <div className='autherrorcontainer'>
            <Image alt={'VisionAid logo'} src={'/images/logo-mainsite.png'} height={100} width={150} />
            <span className='autherrortext'>
              Not authorized.&nbsp;
              <Link href='/' className='autherrorlink'>
                Please try another account.
              </Link>
            </span>
          </div>
        );
      }
    }
  }
  /*-------------- END AUTHORIZATION FAILURE  -------------*/
}
