"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Mail, User, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseApiUrl } from "@/utils/constants";

const initialEmployeeData = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    username: "johnd",
    dob: "1990-05-15",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  // ... other initial data
];

const MotionCard = motion(Card);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function EmployeeOverview({ deptId }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [textshow, setTextshow] = useState(false);
  const [memberData, setMemberData] = useState([]);
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    username: "",
    dob: "",
  });

  // Reset all form-related states when dialog is closed
  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset all states when dialog is closed
      setNewEmployee({
        name: "",
        email: "",
        username: "",
        dob: "",
      });
      setIsEmailVerified(false);
      setIsVerifying(false);
      setTextshow(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!newEmployee.email) return;
    
    setIsVerifying(true);
    setTextshow(false);
    setIsEmailVerified(false);

    try {
      const response = await fetch(`${BaseApiUrl}/api/member/checkemail`, {
        method: 'GET',
        headers: {
          'email': newEmployee.email
        }
      });

      const json = await response.json();

      if (json) {
        if (json.available) {
          setTextshow(true);
        } else {
          setIsEmailVerified(true);
        }
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setTextshow(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
    // Reset verification states when email changes
    if (name === 'email') {
      setIsEmailVerified(false);
      setTextshow(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!isEmailVerified) return;

    try {
      const response = await fetch(`${BaseApiUrl}/api/member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: newEmployee.email,
          memberName: "none",
          departmentId: deptId
        })
      });

      const json = await response.json();

      if (json.data) {
        console.log(json);
        handleDialogChange(false); // Use the handleDialogChange to ensure proper cleanup
        fetchData(); // Fetch updated data after successful addition
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${BaseApiUrl}/api/department/id`, {
        method: 'GET',
        headers: {
          'id': deptId
        }
      });
      
      const json = await response.json();

      if (json) {
        setMemberData(json.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deptId]);

  return (
    <div className="p-6  ">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Overview</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details of the new employee here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    className="flex-grow"
                  />
                  <Button
                    onClick={handleVerifyEmail}
                    disabled={isVerifying || isEmailVerified || !newEmployee.email}
                    size="sm"
                  >
                    {isVerifying ? 'Verifying...' : isEmailVerified ? 'Verified' : 'Verify'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-red-500">
              {textshow && 'Already In the Department'}
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => handleDialogChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} disabled={!isEmailVerified}>
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {employeeData.map((employee, index) => (
          <MotionCard key={index} variants={cardVariants}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {employee.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="font-medium">Email:</span> {employee.email}
                </p>
                <p className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-medium">Username:</span> {employee.username}
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="font-medium">Date of Birth:</span> {employee.dob}
                </p>
              </div>
            </CardContent>
          </MotionCard>
        ))}
      </motion.div> */}





      <div className=" mx-auto px-4 py-8">
      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="max-w-7xl leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                sno
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                designation
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Previlage
              </th>
            </tr>
          </thead>
          <tbody>
            {memberData.map((item, index) => (
              <tr key={index}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap">{index+1}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 border-b w-full border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{item.memberId}</p>
                </td>
                <td className="px-5 py-5 border-b w-full border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{"Software Engineer"}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">Normal User</p>
                </td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

     
    </div>
  );
}