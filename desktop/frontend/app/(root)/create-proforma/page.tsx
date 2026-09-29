import CreateProformaForm from "../../component/CreateProformaForm";

const Page = () => {
  return (
    <div className="flex justify-center pb-24">
      <div className="flex w-5/6 flex-col bg-Sidebar dark:bg-gray-800 rounded-lg items-center p-6">
        {/* Form Component */}
        <CreateProformaForm />
      </div>
    </div>
  );
};

export default Page;